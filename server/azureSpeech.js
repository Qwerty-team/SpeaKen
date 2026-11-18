const sdk = require('microsoft-cognitiveservices-speech-sdk');

// Practice language (as the frontend sends it) -> Azure locale.
const LOCALES = { English: 'en-US', German: 'de-DE' };

function average(list, key) {
  const values = list.map((x) => x[key]).filter((v) => typeof v === 'number');
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Speech-to-text + unscripted pronunciation assessment with Azure AI Speech.
 *
 * @param {Buffer} pcmBuffer  Raw audio: 16 kHz, 16-bit, mono PCM (see speechAnalysis.toPcm)
 * @param {object} options
 * @param {string} options.language  "English" | "German"
 * @param {number} options.timeoutMs Give up after this long
 * @returns {Promise<{transcript, wordCount, accuracy, fluency, pronunciation, mispronounced}>}
 *          Scores are 0–100, or null when no speech was recognised.
 */
function analyzePronunciation(pcmBuffer, { language = 'English', timeoutMs = 240000 } = {}) {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    return Promise.reject(new Error('AZURE_SPEECH_KEY / AZURE_SPEECH_REGION are not set'));
  }

  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = LOCALES[language] || 'en-US';

    const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(format);
    // The SDK expects an ArrayBuffer, not a Node Buffer.
    pushStream.write(pcmBuffer.buffer.slice(pcmBuffer.byteOffset, pcmBuffer.byteOffset + pcmBuffer.byteLength));
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Empty reference text = unscripted assessment (the student speaks freely).
    const assessment = new sdk.PronunciationAssessmentConfig(
      '',
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      false
    );
    assessment.applyTo(recognizer);

    const segments = [];
    const words = [];
    let finished = false;

    const finish = (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      recognizer.stopContinuousRecognitionAsync(
        () => {
          recognizer.close();
          if (err) return reject(err);
          const transcript = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
          resolve({
            transcript,
            wordCount: transcript ? transcript.split(/\s+/).filter(Boolean).length : 0,
            accuracy: average(segments, 'accuracy'),
            fluency: average(segments, 'fluency'),
            pronunciation: average(segments, 'pronunciation'),
            mispronounced: words
              .filter((w) => typeof w.accuracy === 'number' && w.accuracy < 60)
              .slice(0, 15),
          });
        },
        () => {
          recognizer.close();
          reject(err || new Error('Azure: could not stop recognition'));
        }
      );
    };

    const timer = setTimeout(() => finish(new Error('Azure: recognition timed out')), timeoutMs);

    recognizer.recognized = (s, e) => {
      if (e.result.reason !== sdk.ResultReason.RecognizedSpeech || !e.result.text) return;
      const pa = sdk.PronunciationAssessmentResult.fromResult(e.result);
      segments.push({
        text: e.result.text,
        accuracy: pa?.accuracyScore,
        fluency: pa?.fluencyScore,
        pronunciation: pa?.pronunciationScore,
      });
      for (const w of pa?.detailResult?.Words || []) {
        words.push({ word: w.Word, accuracy: w.PronunciationAssessment?.AccuracyScore });
      }
    };

    recognizer.canceled = (s, e) => {
      if (e.reason === sdk.CancellationReason.EndOfStream) return finish();
      finish(new Error(`Azure recognition canceled: ${e.errorDetails || e.reason}`));
    };
    recognizer.sessionStopped = () => finish();

    recognizer.startContinuousRecognitionAsync(
      () => {},
      (err) => finish(new Error(`Azure: could not start recognition: ${err}`))
    );
  });
}

module.exports = { analyzePronunciation, LOCALES };
