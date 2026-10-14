# SpeaKen Database Documentation

## 1. Overview

SpeaKen uses PostgreSQL to store user accounts, speaking practice sessions, audio recordings, assignments, submissions, feedback, and student performance statistics.

The database contains 12 tables and one view: `view_student_performance`.

## 2. Tables

| Table | Purpose |
|---|---|
| `users` | Stores user accounts, credentials hashes, and roles. |
| `topics` | Stores speaking topics and their difficulty levels. |
| `practice_sessions` | Stores users' speaking practice sessions. |
| `audio_recordings` | Stores audio references, transcripts, speaking metrics, and AI feedback. |
| `assignments` | Stores speaking assignments created by instructors. |
| `assignment_submissions` | Connects students' submissions to assignments and audio recordings. |
| `manual_feedback` | Stores instructor feedback for submissions. |
| `student_analytics` | Stores student performance statistics by date. |
| `refresh_tokens` | Stores refresh tokens and their expiration dates. |
| `email_verification_tokens` | Stores email verification token hashes and their status. |
| `user_settings` | Stores microphone preferences for each user. |
| `word_feedback` | Stores pronunciation feedback for individual words in recordings. |

## 3. Relationships

- `practice_sessions.user_id` references `users.id`.
- `practice_sessions.topic_id` references `topics.id`.
- `audio_recordings.session_id` references `practice_sessions.id`.
- `assignments.instructor_id` references `users.id`.
- `assignment_submissions.assignment_id` references `assignments.id`.
- `assignment_submissions.student_id` references `users.id`.
- `assignment_submissions.audio_recording_id` references `audio_recordings.id`.
- `manual_feedback.submission_id` references `assignment_submissions.id`.
- `manual_feedback.instructor_id` references `users.id`.
- `student_analytics.student_id` references `users.id`.
- `refresh_tokens.user_id` references `users.id`.
- `email_verification_tokens.user_id` references `users.id`.
- `user_settings.user_id` references `users.id`.
- `word_feedback.audio_recording_id` references `audio_recordings.id`.

## 4. Integrity Rules

- Primary keys identify individual records.
- Unique constraints prevent duplicate usernames, email addresses, refresh tokens, email-verification token hashes, and user settings per user.
- Check constraints validate role values, score ranges, durations, speaking metrics, difficulty levels, and timestamps.
- Foreign keys maintain referential integrity.
- `ON DELETE CASCADE` removes dependent records when the referenced record is deleted.
- `ON DELETE SET NULL` preserves the dependent record and clears the corresponding foreign key.

## 5. Performance View

`view_student_performance` summarizes student speaking performance. It includes the student ID, username, total recordings, average grammar score, average pronunciation score, and average words per minute.

The view aggregates data from `users`, `practice_sessions`, and `audio_recordings`.

## 6. Development and Testing

The local development database contains test records for users, topics, practice sessions, audio recordings, assignments, submissions, feedback, analytics, tokens, and user settings.

Integrity testing included invalid foreign-key references, invalid score values, negative durations and metrics, unsupported role values, and duplicate checks.

## 7. Assumptions and Pending Verification

- User roles currently include `STUDENT`, `INSTRUCTOR`, and `SYSTEM_ADMINISTRATOR`.
- A submission may have a nullable audio recording reference.
- A practice session may have a nullable topic reference.
- A student may submit an assignment more than once; no unique constraint currently prevents multiple attempts.
- The schema must be compared with the approved SRS and backend API requirements before it is considered final.
- Deletion rules should be reviewed with the backend team before production use.
