# Software Requirements Specification (SRS)
## Project: AI-Powered Speaking Learning Platform
**Repository Path:** `/docs/SRS.md`  
**Version:** 1.0  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **AI-Powered Speaking Learning Platform**. It outlines functional requirements via user stories, non-functional requirements, constraints, and feature prioritization using the MoSCoW framework.

### 1.2 Scope
The platform provides university students with automated, real-time AI feedback on spoken English practice sessions (pronunciation, grammar, fluency, and vocabulary). Instructors can assign speaking topics and track student progress over time.

---

## 2. User Roles

| Role | Description |
| :--- | :--- |
| **Student (Registered User)** | An enrolled university student who practices speaking, completes assignments, and views AI-generated feedback reports. |
| **Instructor** | An academic staff member who creates speaking prompts, assigns tasks, and views aggregate/individual student performance analytics. |
| **System Administrator** | Technical user responsible for user management, system logging, and API key configurations for AI engines. |

---

## 3. Functional Requirements (User Stories & Acceptance Criteria)

### Epic 1: Authentication & User Profile Management

#### US-01: Student Registration
* **User Story:** As a **Student**, I want to create an account using my university email, so that I can access personalized speaking assignments.
* **Acceptance Criteria:**
  * **Given** an unauthenticated visitor on the registration page, **When** they submit a valid `@university.edu` email and strong password, **Then** a verification email is sent, and an inactive account is created.
  * **Given** a valid verification link, **When** the student clicks it, **Then** their account becomes active and redirects to login.
* **INVEST Status:** Pass (Independent, Negotiable, Valuable, Estimable, Small, Testable).

#### US-02: Secure Login
* **User Story:** As a **Registered User**, I want to log in using JWT-based credentials, so that my account and practice data remain secure.
* **Acceptance Criteria:**
  * **Given** a registered user on the login screen, **When** correct credentials are entered, **Then** the system returns a session token and routes to the dashboard.
* **INVEST Status:** Pass.

#### US-03: Profile Microphone & Audio Setup
* **User Story:** As a **Student**, I want to test and save my preferred microphone input settings in my profile, so that audio recordings capture clearly without mid-session errors.
* **Acceptance Criteria:**
  * **Given** a student in Profile Settings, **When** they click "Test Microphone" and speak for 3 seconds, **Then** an audio level meter displays input gain and plays back the sample.
* **INVEST Status:** Pass.

---

### Epic 2: AI Practice Sessions & Audio Recording

#### US-04: Select Practice Topic
* **User Story:** As a **Student**, I want to browse available speaking topics filtered by difficulty level, so that I can choose appropriate prompts.
* **Acceptance Criteria:**
  * **Given** a student on the Topic Catalog, **When** they select "Intermediate", **Then** the list filters to display only intermediate prompts.
* **INVEST Status:** Pass.

#### US-05: Record Audio Response
* **User Story:** As a **Student**, I want to record my voice in real-time with pause and re-record options, so that I can submit my best speaking attempt.
* **Acceptance Criteria:**
  * **Given** an active topic prompt screen, **When** the student clicks "Start Recording", **Then** a timer begins and wave audio visualization renders live.
  * **Given** a completed recording under 5 minutes, **When** the student clicks "Submit", **Then** the audio file transfers to the analysis queue.
* **INVEST Status:** Pass.

#### US-06: Real-time Transcript Preview
* **User Story:** As a **Student**, I want to view a real-time Speech-to-Text transcript while speaking, so that I can confirm my speech is captured accurately.
* **Acceptance Criteria:**
  * **Given** an active recording session, **When** the student speaks into the microphone, **Then** words appear in the preview box within 1.5 seconds.
* **INVEST Status:** Pass.

#### US-07: Practice Session Playback
* **User Story:** As a **Student**, I want to listen to my submitted audio recording, so that I can self-evaluate my pronunciation before reading AI feedback.
* **Acceptance Criteria:**
  * **Given** a completed session page, **When** the student clicks "Play", **Then** the original audio plays back with continuous scrubbing controls.
* **INVEST Status:** Pass.

---

### Epic 3: AI Feedback & Speech Analytics

#### US-08: Automated Grammar & Vocabulary Scoring
* **User Story:** As a **Student**, I want to receive detailed grammar corrections and vocabulary suggestions, so that I can learn proper usage.
* **Acceptance Criteria:**
  * **Given** a submitted audio recording, **When** AI processing completes, **Then** grammatical errors are highlighted in red with suggested inline fixes.
* **INVEST Status:** Pass.

#### US-09: Pronunciation & Phoneme Feedback
* **User Story:** As a **Student**, I want to view mispronounced words highlighted in my transcript, so that I know which specific sounds to correct.
* **Acceptance Criteria:**
  * **Given** an evaluated transcript, **When** a word has a pronunciation score below 70%, **Then** it is highlighted in yellow with a phonetic guide click-popup.
* **INVEST Status:** Pass.

#### US-10: Speaking Pace & Fluency Metrics
* **User Story:** As a **Student**, I want to see my words-per-minute (WPM) rate and pause frequency, so that I can improve my pacing.
* **Acceptance Criteria:**
  * **Given** a finished feedback report, **When** viewing the Fluency tab, **Then** the system displays WPM rate and classifies pacing as "Slow", "Optimal", or "Too Fast".
* **INVEST Status:** Pass.

#### US-11: Historical Progress Dashboard
* **User Story:** As a **Student**, I want to view line charts of my fluency scores over time, so that I can track my overall improvement.
* **Acceptance Criteria:**
  * **Given** a student on their progress page, **When** viewing historical data across 30 days, **Then** average score trends render on an interactive line chart.
* **INVEST Status:** Pass.

---

### Epic 4: Course Management & Instructor Tools

#### US-12: Create Speaking Assignment
* **User Story:** As an **Instructor**, I want to create customized speaking prompts with time limits and due dates, so that I can assign coursework to my class.
* **Acceptance Criteria:**
  * **Given** an instructor on the Assignment Builder, **When** they fill in title, text prompt, maximum duration (e.g., 3 mins), and submit, **Then** the assignment publishes to enrolled students.
* **INVEST Status:** Pass.

#### US-13: Student Submission Review
* **User Story:** As an **Instructor**, I want to view a list of student submissions with AI confidence scores, so that I can identify students needing human intervention.
* **Acceptance Criteria:**
  * **Given** an instructor viewing a class assignment, **When** filtering by "Low AI Score", **Then** submissions scoring below 60% are prioritized at the top of the list.
* **INVEST Status:** Pass.

#### US-14: Manual Instructor Feedback Override
* **User Story:** As an **Instructor**, I want to add custom text and voice comments to a student's submission, so that I can provide targeted coaching.
* **Acceptance Criteria:**
  * **Given** a student submission review page, **When** an instructor types a comment and clicks "Save Feedback", **Then** the student receives an email notification with the feedback.
* **INVEST Status:** Pass.

#### US-15: Export Class Analytics
* **User Story:** As an **Instructor**, I want to export student grades and fluency scores to CSV format, so that I can import them into the university LMS.
* **Acceptance Criteria:**
  * **Given** the class performance dashboard, **When** clicking "Export CSV", **Then** a `.csv` file downloads containing Student ID, Topic, AI Score, and Date.
* **INVEST Status:** Pass.

---

## 4. Non-Functional Requirements (NFRs)

### NFR-01: Performance (Latency & Processing Speed)
* **Requirement:** The AI pipeline must return complete grammar and pronunciation feedback reports within **5.0 seconds** of audio submission for recordings up to 3 minutes long. API responses for navigation must take **less than 300 ms**.

### NFR-02: Security (Data Protection & Privacy)
* **Requirement:** User audio files must be encrypted at rest using **AES-256** and transmitted over HTTPS using **TLS 1.3**. JWT authentication tokens must expire after **15 minutes** of inactivity.

### NFR-03: Usability & Accessibility
* **Requirement:** The web interface must comply with **WCAG 2.1 Level AA** guidelines (including high-contrast ratios and full keyboard navigation). First-time users must be able to complete a recording setup within **3 clicks** from the dashboard.

### NFR-04: Availability & Reliability
* **Requirement:** The platform must maintain **99.5% operational uptime** during regular academic term months, excluding planned weekly maintenance windows between 02:00 and 04:00 AM UTC.

### NFR-05: Scalability
* **Requirement:** The system infrastructure must support at least **200 concurrent live audio recording/transcription streams** without degrading Speech-to-Text accuracy or response latency.

---

## 5. Constraints

* **Browser Constraint:** Full audio recording capabilities require modern browsers supporting WebRTC and MediaRecorder API (Chrome 90+, Firefox 88+, Safari 14+).
* **AI API Dependency:** Third-party Speech-to-Text and NLP models must be called asynchronously to prevent thread blocking on web server processes.
* **Compliance:** System storage must adhere to institutional student privacy regulations (GDPR / FERPA compliant storage).

---

## 6. MoSCoW Prioritization & Requirements Matrix

| Story ID | Epic | Title | MoSCoW Priority | Kanban Board Status |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Authentication | Student Registration | **Must-Have** | Backlog / To Do |
| **US-02** | Authentication | Secure Login | **Must-Have** | Backlog / To Do |
| **US-03** | Authentication | Profile Microphone Setup | **Should-Have** | Backlog |
| **US-04** | AI Practice | Select Practice Topic | **Must-Have** | Backlog / To Do |
| **US-05** | AI Practice | Record Audio Response | **Must-Have** | Backlog / To Do |
| **US-06** | AI Practice | Real-time Transcript Preview | **Should-Have** | Backlog |
| **US-07** | AI Practice | Practice Session Playback | **Should-Have** | Backlog |
| **US-08** | AI Feedback | Grammar & Vocabulary Scoring | **Must-Have** | Backlog / To Do |
| **US-09** | AI Feedback | Pronunciation Feedback | **Must-Have** | Backlog / To Do |
| **US-10** | AI Feedback | Fluency & Pace Metrics | **Should-Have** | Backlog |
| **US-11** | AI Feedback | Historical Progress Dashboard | **Could-Have** | Backlog |
| **US-12** | Course Mgmt | Create Speaking Assignment | **Must-Have** | Backlog / To Do |
| **US-13** | Course Mgmt | Student Submission Review | **Should-Have** | Backlog |
| **US-14** | Course Mgmt | Manual Instructor Feedback | **Could-Have** | Backlog |
| **US-15** | Course Mgmt | Export Class Analytics | **Won't-Have (v1)** | Future Roadmap |

---

## 7. Draft REST API Specifications

| Method | Endpoint | Associated Story | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | US-01 | Студенческая регистрация |
| `POST` | `/api/v1/auth/login` | US-02 | Вход и выдача JWT токена |
| `GET` | `/api/v1/topics` | US-04 | Получение списка топиков с фильтрацией |
| `POST` | `/api/v1/sessions` | US-05 | Создание сессии и загрузка аудиозаписи |
| `GET` | `/api/v1/sessions/{id}/feedback` | US-08, US-09 | Получение отчета AI по грамматике и произношению |
| `GET` | `/api/v1/students/progress` | US-11 | Получение истории оценок для графиков |
| `POST` | `/api/v1/assignments` | US-12 | Создание задания преподавателем |
