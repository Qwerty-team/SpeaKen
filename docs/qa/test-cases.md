# SpeaKen — QA Test Cases

**Project:** SpeaKen — AI-Powered Speaking Learning Platform  
**Team:** QWERTY  
**QA Coordinator:** Assel Kuanyshbaeva  
**Testing Phase:** Week 10  
**Status:** Initial test plan

## Test Case Status Legend

- **PASS** — Actual result matches expected result.
- **FAIL** — Actual result does not match expected result.
- **BLOCKED** — Testing cannot continue because a required feature or dependency is unavailable.
- **NOT RUN** — Test has not been executed yet.

## Test Cases

| ID | Requirement | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-01 | US-01 | Register with valid university email | Registration page is available | 1. Open registration. 2. Enter valid university email and strong password. 3. Submit. | Account is created and verification process starts. | To be tested | NOT RUN |
| TC-02 | US-01 | Register with invalid email | Registration page is available | 1. Open registration. 2. Enter an invalid or non-university email. 3. Submit. | Validation message is displayed. | To be tested | NOT RUN |
| TC-03 | US-01 | Register with an existing email | An account already exists | 1. Enter an already registered email. 2. Submit. | Duplicate registration is rejected. | To be tested | NOT RUN |
| TC-04 | US-02 | Login with valid credentials | A registered account exists | 1. Open login. 2. Enter correct credentials. 3. Submit. | User is authenticated and redirected to the application. | To be tested | NOT RUN |
| TC-05 | US-02 | Login with incorrect password | A registered account exists | 1. Enter a registered email. 2. Enter an incorrect password. 3. Submit. | Login is rejected and an error message is displayed. | To be tested | NOT RUN |
| TC-06 | US-04 | Load available practice topics | User can access the Practice page | 1. Open Practice. 2. Wait for topics to load. | Available topics are displayed. | To be tested | NOT RUN |
| TC-07 | US-04 | Handle an empty topic list | Topic API returns an empty list | 1. Open Practice when no topics are available. | A clear empty-state message is displayed. | To be tested | NOT RUN |
| TC-08 | US-05 | Record and submit a valid audio response | Microphone permission is granted | 1. Open Practice. 2. Select a topic. 3. Record audio. 4. Stop and submit. | Audio is accepted and analysis begins. | To be tested | NOT RUN |
| TC-09 | US-05 | Submit invalid or unsupported audio | Practice page is available | 1. Select an unsupported or invalid audio file, if upload is supported. 2. Submit. | Invalid audio is rejected with a clear message. | To be tested | NOT RUN |
| TC-10 | US-08 | Receive grammar and vocabulary feedback | AI analysis service is available | 1. Submit a valid recording. 2. Wait for analysis. 3. Open feedback. | Grammar corrections and vocabulary suggestions are displayed. | To be tested | NOT RUN |
| TC-11 | US-08 | Handle AI analysis failure | AI service is unavailable or returns an error | 1. Submit a recording. 2. Simulate or wait for an AI service error. | An understandable error message is displayed; the application does not crash. | To be tested | NOT RUN |
| TC-12 | US-09 | Display pronunciation assessment | Azure Speech assessment is available | 1. Submit a recording. 2. Open pronunciation feedback. | Pronunciation scores and available word-level feedback are displayed. | To be tested | NOT RUN |
| TC-13 | US-09 | Handle missing pronunciation results | Pronunciation assessment returns incomplete data | 1. Submit a recording with incomplete assessment results. 2. Open feedback. | Missing results are handled safely without breaking the page. | To be tested | NOT RUN |
| TC-14 | US-12 | Instructor creates an assignment | Instructor module is implemented and accessible | 1. Login as instructor. 2. Open assignments. 3. Enter assignment details. 4. Publish. | Assignment is created and published. | To be tested | NOT RUN |
| TC-15 | US-12 | Reject an incomplete assignment | Instructor module is implemented and accessible | 1. Open assignment creation. 2. Leave required fields empty. 3. Submit. | Validation prevents incomplete assignment creation. | To be tested | NOT RUN |
| TC-16 | US-02 | Prevent unauthenticated access | User is logged out | 1. Log out. 2. Open a protected page or call a protected API endpoint. | Access is denied or user is redirected to login. | To be tested | NOT RUN |

## Testing Summary

| Metric | Result |
|---|---|
| Total test cases | 16 |
| Passed | 0 |
| Failed | 0 |
| Blocked | 0 |
| Not run | 16 |

**Important:** The results above are initial values. Update Actual Result and Status only after executing each test. If the Instructor module is not implemented, mark TC-14 and TC-15 as BLOCKED and explain why.
