# SpeaKen — AI-Powered Speaking Learning Platform

## 1. Project Overview

SpeaKen is an interactive web application designed to help university students and English learners improve their English-speaking skills.

The platform allows users to practise speaking, submit audio recordings, and receive AI-powered feedback.

The system focuses on:

- Pronunciation.
- Grammar.
- Vocabulary.
- Speaking fluency.

## 2. Team QWERTY

| Team Member | Role |
|---|---|
| Assel Kuanyshbaeva | Project Manager |
| Kaussar Kadyrbay | Frontend Developer |
| Alsu Sharafiyeva | Database Developer |
| Dilnaz Asylbek | Backend Developer |

## 3. Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication

### Database
- PostgreSQL

### AI Services
- Azure AI Speech
- Google Gemini API

## 4. Main Features

- User registration and authentication.
- Practice topic selection.
- Audio recording and submission.
- AI-powered speaking analysis.
- Pronunciation assessment.
- Grammar and vocabulary feedback.
- Practice history and progress tracking.

Only features implemented and verified in the final application should be presented as completed.

## 5. System Architecture

```text
                STUDENT
                   |
                   v
            REACT FRONTEND
                   |
                   v
             EXPRESS API
                   |
          +--------+--------+
          |                 |
          v                 v
      POSTGRESQL       AI SERVICES
                          |
                   +------+------+
                   |             |
                   v             v
              AZURE SPEECH    GEMINI
                   |             |
                   +------+------+
                          |
                          v
                   FEEDBACK RESULTS
                          |
                          v
                   REACT FRONTEND
```

## 6. Installation

### Requirements

- Node.js
- npm
- PostgreSQL
- Git

### Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using the environment variables described in `docs/DEPLOY.md`.

Start the backend:

```bash
npm start
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Use the actual frontend directory name in your repository.

## 7. Environment Variables

Never commit the real `.env` file.

Required variables may include:

```env
PORT=3000
DATABASE_URL=YOUR_DATABASE_URL
JWT_SECRET=YOUR_JWT_SECRET
AZURE_SPEECH_KEY=YOUR_AZURE_SPEECH_KEY
AZURE_SPEECH_REGION=YOUR_AZURE_REGION
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
VITE_API_URL=YOUR_BACKEND_API_URL
```

Check the actual backend and frontend configuration before using this example.

## 8. Deployment

Frontend: https://speakken.netlify.app/

Backend: Render deployment.

Database: PostgreSQL.

See `docs/DEPLOY.md` for deployment instructions.

## 9. Documentation

| File | Description |
|---|---|
| `docs/SRS.md` | Software Requirements Specification |
| `docs/DEPLOY.md` | Deployment instructions |
| `docs/qa/test-cases.md` | QA test cases |
| `docs/qa/qa-report-week-10.md` | QA report |
| `docs/deployment-report-week-11.md` | Deployment verification |
| `README.md` | Project overview and setup |

## 10. Project Status

The project status and completed features should reflect the final tested application.

## 11. License

Academic project developed by Team QWERTY.
