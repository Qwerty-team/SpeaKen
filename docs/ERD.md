# SpeaKen — Entity Relationship Documentation

## 1. Overview

The SpeaKen database uses PostgreSQL to store user accounts, speaking topics, practice sessions, recordings, and assignments.

## 2. Main Entities

| Entity | Purpose |
|---|---|
| users | Stores user account information |
| topics | Stores speaking practice topics |
| practice_sessions | Stores speaking session information and analysis results |
| audio_recordings | Stores audio recording information |
| assignments | Stores instructor assignments |
| assignment_submissions | Stores student submissions |

## 3. Relationships

- One user can have multiple practice sessions.
- One topic can be used in multiple practice sessions.
- A practice session can have an associated audio recording.
- One instructor can create multiple assignments.
- One assignment can have multiple submissions.

## 4. Database Verification

The database structure should match the actual PostgreSQL schema, including table names, primary keys, foreign keys, and relationships.

## 5. Final Status

ERD documentation prepared for database review.
