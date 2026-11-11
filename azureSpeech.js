const sdk = require('microsoft-cognitiveservices-speech-sdk');

/**
 * Analyzes audio pronunciation, accuracy, and fluency using Azure AI Speech.
 * @param {Buffer} audioBuffer - Audio file buffer (WAV format recommended)
 * @returns {Promise<{transcript: string, scores: Array}>}
 */
async function analyzePronunciation(audioBuffer) {
  return new Promise((resolve, reject) => {
    // 1. Configure Azure Speech SDK
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = 'en-US';

    // 2. Set up audio input from buffer
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer);
    pushStream.close();
    
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // 3. Configure Pronunciation Assessment
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      '',
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationAssessmentConfig.applyTo(recognizer);

    let fullTranscript = '';
    let wordScores = [];

    // 4. Capture recognition events (continuous mode for 1-3 min recordings)
    recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        fullTranscript += e.result.text + ' ';
        const res = sdk.PronunciationAssessmentResult.fromResult(e.result);
        if (res) {
          wordScores.push({
            accuracyScore: res.accuracyScore,
            pronunciationScore: res.pronunciationScore,
            completenessScore: res.completenessScore,
            fluencyScore: res.fluencyScore
          });
        }
      }
    };

    recognizer.sessionStopped = (s, e) => {
      recognizer.stopContinuousRecognitionAsync(() => {
        resolve({
          transcript: fullTranscript.trim(),
          scores: wordScores
        });
      });
    };

    recognizer.canceled = (s, e) => {
      recognizer.stopContinuousRecognitionAsync(() => {
        reject(new Error(`Azure Recognition Canceled: ${e.errorDetails}`));
      });
    };

    // 5. Start continuous recognition
    recognizer.startContinuousRecognitionAsync();
  });
}

module.exports = { analyzePronunciation };
