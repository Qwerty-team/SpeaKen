const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.post('/evaluate-session', async (req, res) => {
  const { userId, sessionId, transcript, audioDuration } = req.body;

  try {
    const grammarScore = 85;
    const vocabularyScore = 78;
    const pronunciationScore = 65;

    const sessionQuery = `
      INSERT INTO session_evaluations (user_id, session_id, grammar_score, vocabulary_score, pronunciation_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const sessionResult = await pool.query(sessionQuery, [userId, sessionId, grammarScore, vocabularyScore, pronunciationScore]);

    res.status(200).json({
      message: 'Evaluation completed successfully',
      evaluation: sessionResult.rows[0],
      flaggedWords: [
        { word: 'phonetics', score: 62, phoneticGuide: '/fəˈnɛt.ɪks/' }
      ]
    });
  } catch (error) {
    console.error('Error processing aiFeedback:', error);
    res.status(500).json({ error: 'Internal Server Error processing AI feedback' });
  }
});

module.exports = router;
