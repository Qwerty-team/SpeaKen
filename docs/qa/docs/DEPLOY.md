# SpeaKen — Deployment Guide

## 1. Project Architecture

SpeaKen consists of three main components:

- Frontend: React and Vite.
- Backend: Node.js and Express.
- Database: PostgreSQL.

AI services:

- Azure AI Speech for speech and pronunciation assessment.
- Gemini API for personalized grammar and vocabulary feedback.

## 2. Frontend Deployment

The frontend is deployed using Netlify.

Production URL:

https://speakken.netlify.app/

### Frontend Environment Variables

Configure the following variable in the frontend hosting settings:

```env
VITE_API_URL=YOUR_BACKEND_API_URL
```

Replace `YOUR_BACKEND_API_URL` with the actual deployed backend URL.

### Build Command

```bash
npm install
npm run build
```

### Publish Directory

```text
dist
```

## 3. Backend Deployment

The backend is deployed using Render.

### Backend Environment Variables

Configure the following variables in the hosting dashboard:

```env
PORT=3000
DATABASE_URL=YOUR_POSTGRESQL_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET_KEY
AZURE_SPEECH_KEY=YOUR_AZURE_SPEECH_KEY
AZURE_SPEECH_REGION=YOUR_AZURE_REGION
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Use the actual environment variable names from the backend source code.

**Security:** Never commit real API keys, passwords, database URLs, or JWT secrets to GitHub.

## 4. Database Deployment

The application uses PostgreSQL.

The production database should be configured separately from the development database.

Before deployment:

1. Verify the database connection.
2. Apply the required schema and migrations.
3. Check that all required tables exist.
4. Verify that the backend can read and write data.
5. Confirm that production credentials are stored securely.

## 5. CORS Configuration

The backend must allow requests from the deployed frontend domain.

Example:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://speakken.netlify.app"
  ],
  credentials: true
};
```

Adjust this configuration to match the actual frontend deployment URLs.

## 6. Deployment Verification

After deployment, verify:

- [ ] Frontend opens successfully.
- [ ] Backend API is accessible.
- [ ] Frontend can communicate with backend.
- [ ] Registration works.
- [ ] Login works.
- [ ] Topics load correctly.
- [ ] Audio recording works.
- [ ] AI feedback is returned.
- [ ] Practice results are saved in PostgreSQL.
- [ ] Refreshing the page does not break authentication.

## 7. Troubleshooting

### CORS Error

Check the backend CORS configuration and ensure the frontend domain is allowed.

### API Connection Error

Check `VITE_API_URL` and confirm that the backend is running.

### Database Connection Error

Verify `DATABASE_URL` and confirm that the production database is available.

### AI Analysis Error

Verify Azure and Gemini environment variables and check backend logs.

## 8. Security

- Store secrets in hosting environment variables.
- Keep `.env` out of Git.
- Use HTTPS for deployed services.
- Do not expose API keys in frontend code.
- Use authentication for protected endpoints.

## 9. Deployment Status

Update this section after actual deployment verification.

| Component | Platform | Status |
|---|---|---|
| Frontend | Netlify | To be verified |
| Backend | Render | To be verified |
| Database | PostgreSQL | To be verified |
| AI Services | Azure Speech and Gemini | To be verified |
