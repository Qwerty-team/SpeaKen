require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'speaken_db',
  password: 'пароль',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ОШИБКА БАЗЫ ДАННЫХ:', err.message);
  } else {
    console.log('✅ БАЗА ДАННЫХ ПОДКЛЮЧЕНА УСПЕШНО!');
  }
});

app.get('/api/v1/topics', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, category, description FROM topics'
    );

    res.json(result.rows);
  } catch (err) {
    console.error('ОШИБКА В /topics:', err.message);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

app.get('/api/v1/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, category, description FROM topics WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Topic not found'
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('ОШИБКА В /topics/:id:', err.message);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

const PORT = 3000;
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'English Learning App API is running',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
