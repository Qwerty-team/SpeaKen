
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

const MIGRATION = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(30) DEFAULT 'English';

ALTER TABLE topics ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'intermediate';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS reading_text TEXT;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS key_facts JSONB DEFAULT '[]';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS vocabulary JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS practice_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT,
    feedback TEXT
);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'research';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS topic VARCHAR(300);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS topic_guidance TEXT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS language VARCHAR(30);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS evaluation_scale VARCHAR(20) NOT NULL DEFAULT '100-point';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS research_duration_seconds INT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS speaking_time_limit INT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS speaking_duration_seconds INT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS recording_url VARCHAR(500);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS overall_band NUMERIC(3, 1);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS content_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS fluency_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS grammar_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS vocabulary_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS pronunciation_score NUMERIC(5, 2);
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS feedback_summary TEXT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS strengths JSONB NOT NULL DEFAULT '[]';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS improvements JSONB NOT NULL DEFAULT '[]';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS filler_words_notes TEXT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON practice_sessions(user_id, status, session_date DESC);
`;

const STATUSES = ['research', 'presentation', 'completed', 'abandoned'];
const TEXT_FIELDS = [
  'status', 'topic', 'topic_guidance', 'language', 'category', 'difficulty', 'evaluation_scale',
  'recording_url', 'transcript', 'feedback_summary', 'filler_words_notes',
];
const NUMBER_FIELDS = [
  'topic_id', 'research_duration_seconds', 'speaking_time_limit', 'speaking_duration_seconds',
  'overall_score', 'overall_band', 'content_score', 'fluency_score', 'grammar_score',
  'vocabulary_score', 'pronunciation_score',
];
const JSON_FIELDS = ['strengths', 'improvements'];
const NUMERIC_OUT = [
  'overall_score', 'overall_band', 'content_score', 'fluency_score', 'grammar_score',
  'vocabulary_score', 'pronunciation_score',
];
const PROFILE_FIELDS = ['display_name', 'full_name', 'username', 'bio', 'avatar_url', 'language'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MIME_EXT = {
  'audio/webm': '.webm', 'video/webm': '.webm', 'audio/ogg': '.ogg', 'audio/mpeg': '.mp3',
  'audio/wav': '.wav', 'audio/mp4': '.m4a', 'video/mp4': '.mp4',
};

function serializeSession(row) {
  const out = { ...row, id: String(row.id), created_date: row.session_date };
  for (const k of NUMERIC_OUT) out[k] = row[k] === null || row[k] === undefined ? null : Number(row[k]);
  delete out.user_id;
  return out;
}

function pickSessionFields(body = {}) {
  const fields = [];
  const values = [];
  for (const k of TEXT_FIELDS) {
    if (body[k] === undefined) continue;
    fields.push(k);
    values.push(body[k] === null ? null : String(body[k]));
  }
  for (const k of NUMBER_FIELDS) {
    if (body[k] === undefined) continue;
    const n = body[k] === null || body[k] === '' ? null : Number(body[k]);
    fields.push(k);
    values.push(Number.isFinite(n) ? n : null);
  }
  for (const k of JSON_FIELDS) {
    if (body[k] === undefined) continue;
    fields.push(k);
    values.push(JSON.stringify(Array.isArray(body[k]) ? body[k] : []));
  }
  return { fields, values };
}

function publicProfile(u) {
  return {
    id: String(u.id),
    email: u.email,
    username: u.username,
    display_name: u.display_name || u.username,
    full_name: u.full_name || '',
    bio: u.bio || '',
    avatar_url: u.avatar_url || '',
    language: u.language || 'English',
    created_date: u.created_at,
    role: u.role,
  };
}
function extractFile(body, contentTypeHeader) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentTypeHeader || '');
  if (!match) return null;
  const boundary = Buffer.from(`--${match[1] || match[2]}`);
  let start = body.indexOf(boundary);
  while (start !== -1) {
    const headerStart = start + boundary.length + 2;
    const headerEnd = body.indexOf('\r\n\r\n', headerStart);
    if (headerEnd === -1) return null;
    const headers = body.slice(headerStart, headerEnd).toString('utf8');
    const next = body.indexOf(boundary, headerEnd);
    if (next === -1) return null;
    if (/filename=/i.test(headers)) {
      const ct = /content-type:\s*([^\r\n;]+)/i.exec(headers);
      return {
        contentType: ct ? ct[1].trim().toLowerCase() : 'application/octet-stream',
        data: body.slice(headerEnd + 4, next - 2),
      };
    }
    start = next;
  }
  return null;
}
function seeded(seedText, salt) {
  let h = 2166136261;
  for (const ch of `${seedText}:${salt}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}
function demoAnalysis({ audio_url = '', speaking_duration_seconds = 0, evaluation_scale = '100-point', topic = '' }) {
  const seconds = Number(speaking_duration_seconds) || 0;
  const scale = evaluation_scale === 'ielts' ? 'ielts' : '100-point';
  const transcript =
    '[Demo] Speech-to-text is not connected yet, so the transcript is not available. Scores below are generated by the demo evaluator.';

  if (seconds < 5) {
    const zero = { fluency_score: 0, vocabulary_score: 0, grammar_score: 0 };
    return {
      scale,
      transcript,
      ...(scale === 'ielts'
        ? { ...zero, overall_band: 0, pronunciation_score: 0 }
        : { ...zero, overall_score: 0, content_score: 0 }),
      feedback_summary: 'The recording was too short to evaluate. Try speaking for at least 30 seconds.',
      strengths: [],
      improvements: ['Speak for at least 30 seconds so there is enough material to evaluate.'],
      filler_words_notes: 'Not enough speech to analyse.',
    };
  }

  const lengthFactor = Math.min(seconds / 120, 1);
  const seed = audio_url || `${topic}:${seconds}`;
  const criterion = (salt) => Math.min(1, 0.45 + 0.35 * lengthFactor + 0.2 * seeded(seed, salt));
  const c = {
    content: criterion('content'), fluency: criterion('fluency'), vocabulary: criterion('vocab'),
    grammar: criterion('grammar'), pron: criterion('pron'),
  };
  const weakest = Object.entries({ fluency: c.fluency, vocabulary: c.vocabulary, grammar: c.grammar })
    .sort((a, b) => a[1] - b[1])[0][0];
  const tips = {
    fluency: 'Reduce long pauses — plan your next point while finishing the current one.',
    vocabulary: 'Use more topic-specific words from the vocabulary list in the research phase.',
    grammar: 'Watch verb tenses when you switch between past examples and present opinions.',
  };
  const common = {
    scale,
    transcript,
    feedback_summary:
      seconds >= 60
        ? `Good, well-developed answer on "${topic}". Your ideas were organised and you kept talking for ${Math.round(seconds)} seconds.`
        : `A solid start on "${topic}". Try to develop your ideas further — aim for 1–2 minutes of speaking.`,
    strengths: [
      'Clear structure with an introduction and main points',
      seconds >= 60 ? 'Kept speaking for a full minute or more' : 'Started confidently',
    ],
    improvements: [tips[weakest], 'Finish with a short conclusion that sums up your opinion.'],
    filler_words_notes: 'Filler-word detection will be available once speech-to-text is connected.',
  };

  if (scale === 'ielts') {
    const band = (x) => Math.round(x * 9 * 2) / 2;
    const bands = {
      fluency_score: band(c.fluency),
      vocabulary_score: band(c.vocabulary),
      grammar_score: band(c.grammar),
      pronunciation_score: band(c.pron),
    };
    const avg = (bands.fluency_score + bands.vocabulary_score + bands.grammar_score + bands.pronunciation_score) / 4;
    return { ...common, ...bands, overall_band: Math.round(avg * 2) / 2 };
  }

  const pts = (x) => Math.round(x * 25);
  const parts = {
    content_score: pts(c.content),
    fluency_score: pts(c.fluency),
    vocabulary_score: pts(c.vocabulary),
    grammar_score: pts(c.grammar),
  };
  return {
    ...common,
    ...parts,
    overall_score: parts.content_score + parts.fluency_score + parts.vocabulary_score + parts.grammar_score,
  };
}
module.exports = function demoRoutes({ pool, requireAuth }) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const ready = pool
    .query(MIGRATION)
    

  const router = express.Router();
  const uid = (req) => req.user.id;
  const wrap = (fn) => async (req, res) => {
    try {
      await ready;
      await fn(req, res);
    } catch (err) {
      console.error(`❌ ${req.method} ${req.path}:`, err.message);
      if (err.code === '23505') return res.status(409).json({ error: 'This value is already taken' });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  router.get('/api/health', wrap(async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  }));
  router.patch('/api/auth/me', requireAuth, wrap(async (req, res) => {
    const fields = PROFILE_FIELDS.filter((k) => req.body && req.body[k] !== undefined);
    let row;
    if (fields.length === 0) {
      ({ rows: [row] } = await pool.query('SELECT * FROM users WHERE id = $1', [uid(req)]));
    } else {
      const sets = fields.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = fields.map((k) => (req.body[k] === null ? null : String(req.body[k])));
      ({ rows: [row] } = await pool.query(
        `UPDATE users SET ${sets} WHERE id = $1 RETURNING *`,
        [uid(req), ...values]
      ));
    }
    res.json(publicProfile(row));
  }));
  router.get('/api/sessions', requireAuth, wrap(async (req, res) => {
    const params = [uid(req)];
    let where = 'user_id = $1';
    if (req.query.status) {
      params.push(String(req.query.status));
      where += ` AND status = $${params.length}`;
    }
    params.push(Math.min(Math.max(Number(req.query.limit) || 100, 1), 500));
    const { rows } = await pool.query(
      `SELECT * FROM practice_sessions WHERE ${where} ORDER BY session_date DESC LIMIT $${params.length}`,
      params
    );
    res.json(rows.map(serializeSession));
  }));

  router.post('/api/sessions', requireAuth, wrap(async (req, res) => {
    if (req.body?.status && !STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { fields, values } = pickSessionFields(req.body);
    const cols = ['user_id', ...fields];
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO practice_sessions (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      [uid(req), ...values]
    );
    res.status(201).json(serializeSession(rows[0]));
  }));

  router.get('/api/sessions/:id', requireAuth, wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid session id' });
    const { rows } = await pool.query(
      'SELECT * FROM practice_sessions WHERE id = $1 AND user_id = $2',
      [id, uid(req)]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Session not found' });
    res.json(serializeSession(rows[0]));
  }));

  router.patch('/api/sessions/:id', requireAuth, wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid session id' });
    if (req.body?.status && !STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { fields, values } = pickSessionFields(req.body);
    const sets = fields.map((k, i) => `${k} = $${i + 3}`);
    sets.push('updated_at = CURRENT_TIMESTAMP');
    const { rows } = await pool.query(
      `UPDATE practice_sessions SET ${sets.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, uid(req), ...values]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Session not found' });
    res.json(serializeSession(rows[0]));
  }));
  router.post('/api/functions/generateTopic', requireAuth, wrap(async (req, res) => {
    const category = req.body?.category && req.body.category !== 'Random' ? String(req.body.category) : null;
    const difficulty = DIFFICULTIES.includes(req.body?.difficulty) ? req.body.difficulty : null;
    const attempts = [[category, difficulty], [category, null], [null, difficulty], [null, null]];
    let topic = null;
    for (const [cat, diff] of attempts) {
      const { rows } = await pool.query(
        `SELECT * FROM topics
         WHERE ($1::text IS NULL OR category ILIKE $1) AND ($2::text IS NULL OR difficulty = $2)
         ORDER BY random() LIMIT 1`,
        [cat, diff]
      );
      if (rows[0]) { topic = rows[0]; break; }
    }
    if (!topic) return res.status(404).json({ error: 'No topics in the database yet.' });

    const description = topic.description || '';
    res.json({
      topic_id: String(topic.id),
      topic: topic.title,
      description,
      reading_text:
        topic.reading_text ||
        `${description}\n\nPrepare 2–3 main points about "${topic.title}", give a real example for each, and finish with your own opinion.`,
      key_facts: Array.isArray(topic.key_facts) && topic.key_facts.length
        ? topic.key_facts
        : [
            'Start with a short introduction of the topic.',
            'Support each point with an example from your own life.',
            'Finish with a clear conclusion.',
          ],
      vocabulary: Array.isArray(topic.vocabulary) ? topic.vocabulary : [],
    });
  }));

  router.post('/api/functions/analyzePresentation', requireAuth, wrap(async (req, res) => {
    res.json(demoAnalysis(req.body || {}));
  }));
  router.post(
    '/api/upload',
    requireAuth,
    express.raw({ type: 'multipart/form-data', limit: '100mb' }),
    wrap(async (req, res) => {
      if (!Buffer.isBuffer(req.body)) return res.status(400).json({ error: 'Expected multipart/form-data' });
      const file = extractFile(req.body, req.headers['content-type']);
      if (!file || file.data.length === 0) return res.status(400).json({ error: 'No file uploaded' });
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${MIME_EXT[file.contentType] || '.webm'}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, name), file.data);
      res.status(201).json({ file_url: `/uploads/${name}` });
    })
  );

  router.use('/uploads', express.static(UPLOAD_DIR));

  return router;
};

module.exports.demoAnalysis = demoAnalysis;
module.exports.extractFile = extractFile;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
