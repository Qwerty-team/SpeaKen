const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    token: 'fake-jwt-token-123',
    user: { email: req.body.email || 'student@university.edu', role: 'student' }
  });
});

app.get('/api/v1/topics', (req, res) => {
  res.json([
    { id: 1, title: 'Job Interview Practice', difficulty: 'Intermediate' },
    { id: 2, title: 'Daily Conversation & Small Talk', difficulty: 'Beginner' }
  ]);
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