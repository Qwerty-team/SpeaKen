

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT,
    feedback TEXT
);

ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

CREATE TABLE IF NOT EXISTS audio_recordings (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES practice_sessions(id) ON DELETE CASCADE,
    audio_url VARCHAR(500) NOT NULL,
    transcript TEXT,
    wpm_rate INT,
    grammar_score INT,
    pronunciation_score INT,
    ai_feedback_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    instructor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    prompt_text TEXT NOT NULL,
    max_duration_seconds INT DEFAULT 180,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    audio_recording_id BIGINT REFERENCES audio_recordings(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_topics_title ON topics(title);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_session ON audio_recordings(session_id);



CREATE OR REPLACE VIEW view_student_performance AS
SELECT
    u.id AS student_id,
    u.username,
    COUNT(ar.id) AS total_recordings,
    ROUND(AVG(ar.grammar_score), 2) AS avg_grammar,
    ROUND(AVG(ar.pronunciation_score), 2) AS avg_pronunciation,
    ROUND(AVG(ar.wpm_rate), 0) AS avg_wpm
FROM users u
LEFT JOIN practice_sessions ps ON u.id = ps.user_id
LEFT JOIN audio_recordings ar ON ps.id = ar.session_id
WHERE u.role = 'STUDENT'
GROUP BY u.id, u.username;



CREATE TABLE IF NOT EXISTS manual_feedback (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    instructor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS student_analytics (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    avg_grammar_score NUMERIC(5, 2),
    avg_pronunciation_score NUMERIC(5, 2),
    avg_wpm INT,
    total_practice_minutes INT DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    CONSTRAINT unique_student_date UNIQUE (student_id, recorded_date)
);


CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_analytics_student_date ON student_analytics(student_id, recorded_date);