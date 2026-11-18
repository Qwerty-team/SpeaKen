const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { analyzePronunciation } = require('./azureSpeech');
const { generateFeedback } = require('./geminiFeedback');

// Fewer recognised words than this = the student did not really speak.
const MIN_WORDS = 5;

class AnalysisError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/** Browser recording (webm/ogg/mp4, with or without video) -> 16 kHz mono 16-bit PCM. */
function toPcm(inputPath) {
  return new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      ['-hide_banner', '-loglevel', 'error', '-i', inputPath, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-acodec', 'pcm_s16le', 'pipe:1'],
      { encoding: 'buffer', maxBuffer: 200 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`ffmpeg failed: ${stderr?.toString() || err.message}`));
        resolve(stdout);
      }
    );
  });
}

const round = (x) => Math.round(x);
const toQuarter = (x) => round((x / 100) * 25); // 0–100 -> 0–25
const toBand = (x) => Math.max(0, Math.min(9, Math.round((x / 100) * 9 * 2) / 2)); // 0–100 -> IELTS 0–9 in 0.5 steps

function silentResult(scale, transcript, seconds) {
  const zero = { fluency_score: 0, vocabulary_score: 0, grammar_score: 0 };
  return {
    scale,
    transcript: transcript || '[No speech detected]',
    ...(scale === 'ielts'
      ? { ...zero, pronunciation_score: 0, overall_band: 0 }
      : { ...zero, content_score: 0, overall_score: 0 }),
    feedback_summary:
      seconds < 5
        ? 'The recording was too short to evaluate.'
        : 'No speech was detected in your recording, so it could not be scored.',
    strengths: [],
    improvements: ['Check that your microphone is on and speak clearly for at least 30 seconds.'],
    filler_words_notes: 'No speech detected.',
  };
}

/**
 * Real analysis of one recording: ffmpeg -> Azure (speech-to-text, fluency, pronunciation)
 * -> Gemini (content, vocabulary, grammar, coherence, written feedback).
 * Never returns invented scores: on failure it throws AnalysisError.
 */
async function analyzeRecording({ filePath, durationSeconds, scale, topic, language, level }) {
  const seconds = Number(durationSeconds) || 0;
  if (seconds < 5) return silentResult(scale, '', seconds);

  let pcm;
  try {
    pcm = await toPcm(filePath);
  } catch (err) {
    console.error('AUDIO CONVERT ERROR:', err.message);
    throw new AnalysisError('Could not read the recording. Please record again.', 422);
  }

  let azure;
  try {
    azure = await analyzePronunciation(pcm, { language, timeoutMs: (seconds + 90) * 1000 });
  } catch (err) {
    console.error('AZURE ERROR:', err.message);
    throw new AnalysisError('Speech recognition is unavailable right now. Please try again later.');
  }

  if (azure.wordCount < MIN_WORDS) return silentResult(scale, azure.transcript, seconds);

  const wpm = round(azure.wordCount / (seconds / 60));

  let ai;
  try {
    ai = await generateFeedback({
      topic: topic || 'General speaking practice',
      language: language || 'English',
      level,
      transcript: azure.transcript,
      durationSeconds: seconds,
      wordCount: azure.wordCount,
      wpm,
      azure,
    });
  } catch (err) {
    console.error('GEMINI ERROR:', err.message);
    throw new AnalysisError('AI feedback is unavailable right now. Please try again later.');
  }

  // Very short answers cannot get a high content score, whatever the model says.
  const content = azure.wordCount < 40 ? Math.min(ai.content, 40) : ai.content;
  const fluency = azure.fluency ?? 0;
  const pronunciation = azure.pronunciation ?? 0;

  const common = {
    scale,
    transcript: azure.transcript,
    words_per_minute: wpm,
    feedback_summary: ai.feedback_summary,
    strengths: ai.strengths,
    improvements: ai.improvements,
    grammar_errors: ai.grammar_errors,
    mispronounced_words: azure.mispronounced.map((w) => w.word),
    filler_words_notes: ai.filler_words_notes,
  };

  if (scale === 'ielts') {
    const bands = {
      fluency_score: toBand((fluency + ai.coherence) / 2), // IELTS "Fluency and coherence"
      vocabulary_score: toBand(ai.vocabulary),
      grammar_score: toBand(ai.grammar),
      pronunciation_score: toBand(pronunciation),
    };
    const avg = (bands.fluency_score + bands.vocabulary_score + bands.grammar_score + bands.pronunciation_score) / 4;
    return { ...common, ...bands, overall_band: Math.round(avg * 2) / 2 };
  }

  const parts = {
    content_score: toQuarter(content),
    fluency_score: toQuarter((fluency + pronunciation) / 2),
    vocabulary_score: toQuarter(ai.vocabulary),
    grammar_score: toQuarter(ai.grammar),
  };
  return {
    ...common,
    ...parts,
    pronunciation_score: toQuarter(pronunciation),
    overall_score: parts.content_score + parts.fluency_score + parts.vocabulary_score + parts.grammar_score,
  };
}

module.exports = { analyzeRecording, AnalysisError, toPcm, MIN_WORDS };
