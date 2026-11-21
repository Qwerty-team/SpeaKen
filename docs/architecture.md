# SpeaKen — System Architecture

## 1. Overview

SpeaKen uses a client-server architecture to provide interactive English speaking practice.

## 2. Main Components

| Component | Technology | Responsibility |
|---|---|---|
| Frontend | React and Vite | User interface |
| Backend | Node.js and Express | API and application logic |
| Database | PostgreSQL | Data storage |
| Speech Analysis | Azure AI Speech | Pronunciation and speech assessment |
| Language Feedback | Gemini API | Grammar and vocabulary feedback |

## 3. System Flow

1. User opens the React frontend.
2. Frontend sends requests to the Express backend.
3. Backend processes requests.
4. PostgreSQL stores and retrieves information.
5. Backend sends audio for speech analysis using Azure AI Speech.
6. Gemini generates language feedback.
7. Backend returns available results to the frontend.
8. User views the feedback.

## 4. Deployment

- Frontend: Netlify
- Backend: Render
- Database: PostgreSQL

## 5. Security

- JWT authentication is used.
- Protected resources require authorization.
- API credentials are stored in environment variables.
