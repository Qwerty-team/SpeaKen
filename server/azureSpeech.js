
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { spawn } = require('child_process');

function convertToPcm(audioBuffer) {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
      return reject(new Error('Audio buffer is empty or invalid'));
    }

    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-f', 's16le',
      'pipe:1'
    ]);

    const output = [];
    const errors = [];
    let settled = false;

    function fail(error) {
      if (settled) return;
      settled = true;
      reject(error);
    }

    ffmpeg.stdout.on('data', chunk => output.push(chunk));
    ffmpeg.stderr.on('data', chunk => errors.push(chunk));

    ffmpeg.on('error', fail);

    ffmpeg.on('close', code => {
      if (settled) return;

      if (code !== 0) {
        return fail(new Error(
          `FFmpeg conversion failed: ${Buffer.concat(errors).toString()}`
        ));
      }

      const pcm = Buffer.concat(output);

      if (pcm.length === 0) {
        return fail(new Error('Converted audio is empty'));
      }

      settled = true;
      resolve(pcm);
    });

    ffmpeg.stdin.on('error', fail);
    ffmpeg.stdin.end(audioBuffer);
  });
}

function averageScores(scores) {
  if (!scores.length) return null;

  const fields = [
    'accuracyScore',
    'pronunciationScore',
    'fluencyScore',
    'completenessScore'
  ];

  const result = {};

  for (const field of fields) {
    const values = scores
      .map(item => item[field])
      .filter(value => Number.isFinite(value));

    result[field] = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  }

  return result;
}

async function analyzePronunciation(audioBuffer) {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech credentials are missing');
  }

  const pcmBuffer = await convertToPcm(audioBuffer);

  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    // First version: English only.
    speechConfig.speechRecognitionLanguage = 'en-US';

    const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(format);

    const pcmArrayBuffer = pcmBuffer.buffer.slice(
      pcmBuffer.byteOffset,
      pcmBuffer.byteOffset + pcmBuffer.byteLength
    );

    pushStream.write(pcmArrayBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Empty reference text: assess spontaneous speech.
    const assessmentConfig = new sdk.PronunciationAssessmentConfig(
      '',
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );

    assessmentConfig.applyTo(recognizer);

    let transcript = '';
    const scores = [];
    let settled = false;

    const timeout = setTimeout(() => {
      finish(new Error('Azure recognition timed out'));
    }, 180000);

    function finish(error, result) {
      if (settled) return;

      settled = true;
      clearTimeout(timeout);

      try {
        recognizer.close();
      } catch (closeError) {
        console.error('Azure recognizer close error:', closeError.message);
      }

      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }

    recognizer.recognized = (sender, event) => {
      if (event.result.reason !== sdk.ResultReason.RecognizedSpeech) {
        return;
      }

      transcript += event.result.text + ' ';

      const assessment =
        sdk.PronunciationAssessmentResult.fromResult(event.result);

      if (assessment) {
        scores.push({
          accuracyScore: assessment.accuracyScore,
          pronunciationScore: assessment.pronunciationScore,
          completenessScore: assessment.completenessScore,
          fluencyScore: assessment.fluencyScore
        });
      }
    };

    recognizer.sessionStopped = () => {
      finish(null, {
        transcript: transcript.trim(),
        scores,
        averages: averageScores(scores)
      });
    };

    recognizer.canceled = (sender, event) => {
      finish(new Error(
        `Azure recognition canceled: ${event.errorDetails || event.reason}`
      ));
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        console.log('Azure continuous recognition started');
      },
      error => {
        finish(new Error(`Azure start error: ${error}`));
      }
    );
  });
}

module.exports = { analyzePronunciation };

