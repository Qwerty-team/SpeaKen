
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { spawn } = require('child_process');

// Convert uploaded audio/video container to raw PCM:
// 16 kHz, 16-bit, mono.
function convertToPcm(audioBuffer) {
  return new Promise((resolve, reject) => {
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

    ffmpeg.stdout.on('data', chunk => output.push(chunk));
    ffmpeg.stderr.on('data', chunk => errors.push(chunk));

    ffmpeg.on('error', reject);

    ffmpeg.on('close', code => {
      if (code !== 0) {
        return reject(
          new Error(
            `FFmpeg conversion failed: ${Buffer.concat(errors).toString()}`
          )
        );
      }

      const pcm = Buffer.concat(output);

      if (pcm.length === 0) {
        return reject(new Error('Converted audio is empty'));
      }

      resolve(pcm);
    });

    ffmpeg.stdin.on('error', reject);
    ffmpeg.stdin.end(audioBuffer);
  });
}

async function analyzePronunciation(audioBuffer) {
  const pcmBuffer = await convertToPcm(audioBuffer);

  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    speechConfig.speechRecognitionLanguage = 'en-US';

    const format = sdk.AudioStreamFormat.getWaveFormatPCM(
      16000,
      16,
      1
    );

    const pushStream = sdk.AudioInputStream.createPushStream(format);

    // Convert Node Buffer into an ArrayBuffer.
    const pcmArrayBuffer = pcmBuffer.buffer.slice(
      pcmBuffer.byteOffset,
      pcmBuffer.byteOffset + pcmBuffer.byteLength
    );

    pushStream.write(pcmArrayBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

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
      recognizer.stopContinuousRecognitionAsync(
        () => finish(new Error('Azure recognition timed out')),
        err => finish(new Error(String(err)))
      );
    }, 45000);

    function finish(error, result) {
      if (settled) return;
      settled = true;

      clearTimeout(timeout);
      recognizer.close();

      if (error) reject(error);
      else resolve(result);
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
        scores
      });
    };

    recognizer.canceled = (sender, event) => {
      finish(
        new Error(
          `Azure Recognition Canceled: ${event.errorDetails || event.reason}`
        )
      );
    };

    recognizer.startContinuousRecognitionAsync(
      () => {},
      error => finish(error)
    );
  });
}

module.exports = { analyzePronunciation };
