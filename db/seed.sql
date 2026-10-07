-- =============================================
-- SEED DATA
-- =============================================

-- 1. Тесттік пайдаланушылар (Мұғалім және Студент)
INSERT INTO users (username, email, password_hash, role)
VALUES
    ('teacher_demo', 'teacher@sdu.edu.kz', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/S8f2tU', 'INSTRUCTOR'),
    ('student_demo', 'student@sdu.edu.kz', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/S8f2tU', 'STUDENT')
ON CONFLICT DO NOTHING;

-- 2. Практикаға арналған бастапқы тақырыптар
INSERT INTO topics (title, category, description)
VALUES
    ('Self Introduction', 'General', 'Practice introducing yourself in English'),
    ('Job Interview', 'Business', 'Common interview questions and answers'),
    ('University Life', 'Academic', 'Talk about your campus and daily routine')
ON CONFLICT DO NOTHING;

-- 3. Мұғалімнің тапсырмасы (Assignment)
INSERT INTO assignments (instructor_id, title, prompt_text, max_duration_seconds, due_date)
VALUES (
    (SELECT id FROM users WHERE email = 'teacher@sdu.edu.kz' LIMIT 1),
    ('Introduce Your Software Project', 'Record a 2-minute pitch about your current team project.', 120, CURRENT_TIMESTAMP + INTERVAL '7 days')
)
ON CONFLICT DO NOTHING;