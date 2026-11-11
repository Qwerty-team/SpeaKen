const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// US-08, US-09, US-10: Processar análise de IA da submissão
router.post('/submissions/:id/analyze', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { transcript, audioDurationSeconds, wordCount, errorsCount, mispronouncedWords } = req.body;

  try {
    const durationMinutes = audioDurationSeconds / 60;
    const wpm = Math.round(wordCount / durationMinutes);
    let pacingStatus = 'Optimal';
    if (wpm < 110) pacingStatus = 'Slow';
    else if (wpm > 160) pacingStatus = 'Too Fast';

    const grammarErrors = req.body.grammarErrors || [
      { original: 'He go', fix: 'He goes', type: 'Grammar', start: 0, end: 5 }
    ];

    const pronunciationIssues = (mispronouncedWords || []).filter(item => item.score < 70);
    const aiScore = Math.max(0, 100 - (errorsCount * 5) - (pronunciationIssues.length * 3));

    const result = await pool.query(
      `UPDATE submissions 
       SET transcript = $1, wpm = $2, pacing_status = $3, grammar_errors = $4, 
           pronunciation_issues = $5, overall_ai_score = $6
       WHERE id = $7 RETURNING *`,
      [transcript, wpm, pacingStatus, JSON.stringify(grammarErrors), JSON.stringify(pronunciationIssues), aiScore, id]
    );

    res.json({ message: 'Analysis completed successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// US-11: Obter histórico de progresso de 30 dias do estudante
router.get('/students/:studentId/progress', authenticateToken, async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT DATE(created_at) as date, AVG(overall_ai_score) as average_score
       FROM submissions
       WHERE student_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [studentId]
    );

    res.json({ studentId, trendData: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
