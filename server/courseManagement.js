const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.get('/topics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM topics ORDER BY id ASC;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error fetching topics' });
  }
});

router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM user_progress WHERE user_id = $1;', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal Server Error fetching progress' });
  }
});

module.exports = router;
