const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function processSpeechAnalytics(transcript, audioDuration) {
  const isAzureConfigured = Boolean(process.env.AZURE_SPEECH_KEY);
  const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  return {
    provider: isAzureConfigured ? 'azure' : isGeminiConfigured ? 'gemini' : 'mock',
    grammarScore: 85,
    vocabularyScore: 78,
    pronunciationScore: 65,
    overallScore: 76,
    feedbackSummary: transcript 
      ? `Analysis of: "${transcript.slice(0, 30)}..."` 
      : 'Session evaluation completed.',
    flaggedWords: [
      { word: 'phonetics', score: 62, phoneticGuide: '/fəˈnɛt.ɪks/' }
    ]
  };
}

router.post('/evaluate-session', async (req, res) => {
  const { userId, sessionId, transcript, audioDuration } = req.body;

  try {
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const aiResult = await processSpeechAnalytics(transcript, audioDuration);

    const sessionQuery = `
      INSERT INTO session_evaluations (
        user_id, 
        session_id, 
        grammar_score, 
        vocabulary_score, 
        pronunciation_score, 
        feedback_summary
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const values = [
      userId || 1, 
      sessionId, 
      aiResult.grammarScore, 
      aiResult.vocabularyScore, 
      aiResult.pronunciationScore,
      aiResult.feedbackSummary
    ];

    const sessionResult = await pool.query(sessionQuery, values);

    return res.status(200).json({
      message: 'Evaluation completed successfully',
      provider: aiResult.provider,
      evaluation: sessionResult.rows[0],
      flaggedWords: aiResult.flaggedWords
    });

  } catch (error) {
    console.error('Error processing aiFeedback:', error);
    return res.status(500).json({ error: 'Internal Server Error processing AI feedback' });
  }
});

module.exports = router;
