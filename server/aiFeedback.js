const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// US-08, US-09, US-10: Processar análise de IA da submissão
router.post('/submissions/:id/analyze', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { transcript, audioDurationSeconds, wordCount, errorsCount, mispronouncedWords } = req.body;

  try {
    const cleanedTranscript = transcript ? transcript.trim() : '';
    const actualWordCount = wordCount || cleanedTranscript.split(/\s+/).filter(Boolean).length;

    if (!cleanedTranscript || actualWordCount < 2 || (audioDurationSeconds && audioDurationSeconds > 0 && actualWordCount === 0)) {
      const zeroResult = await pool.query(
        `UPDATE submissions 
         SET transcript = $1, wpm = 0, pacing_status = 'None', grammar_errors = $2, 
             pronunciation_issues = $3, overall_ai_score = $4
         WHERE id = $5 RETURNING *`,
        [
          cleanedTranscript || '[No speech detected]', 
          JSON.stringify([]), 
          JSON.stringify([]), 
          0, 
          id
        ]
      );

      return res.status(200).json({ 
        message: 'Speech not detected or recording was silent.', 
        data: zeroResult.rows[0],
        warning: 'Речь не обнаружена. Пожалуйста, запишите ответ еще раз.' 
      });
    }

    const durationMinutes = (audioDurationSeconds && audioDurationSeconds > 0) ? audioDurationSeconds / 60 : 1;
    const wpm = Math.round(actualWordCount / durationMinutes);
    let pacingStatus = 'Optimal';
    if (wpm < 110) pacingStatus = 'Slow';
    else if (wpm > 160) pacingStatus = 'Too Fast';

    const grammarErrors = req.body.grammarErrors || [];
    const pronunciationIssues = (mispronouncedWords || []).filter(item => item.score < 70);
    const aiScore = Math.max(0, 100 - ((errorsCount || 0) * 5) - (pronunciationIssues.length * 3));

    const result = await pool.query(
      `UPDATE submissions 
       SET transcript = $1, wpm = $2, pacing_status = $3, grammar_errors = $4, 
           pronunciation_issues = $5, overall_ai_score = $6
       WHERE id = $7 RETURNING *`,
      [cleanedTranscript, wpm, pacingStatus, JSON.stringify(grammarErrors), JSON.stringify(pronunciationIssues), aiScore, id]
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
