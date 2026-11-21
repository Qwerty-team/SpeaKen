Week 10 — Quality Assurance Report
Project: SpeaKen
Team: QWERTY
QA Coordinator: Assel Kuanyshbaeva
1. QA Activities
During Week 10, the team prepared a QA test plan for the SpeaKen application.
The test cases cover:
Student registration and authentication.
Practice topic selection.
Audio recording and submission.
AI grammar and vocabulary feedback.
Pronunciation assessment.
Instructor assignment functionality.
Authentication and protected routes.
Full test cases: docs/qa/test-cases.md
2. Test Execution Summary
A total of 16 test cases were prepared. Results so far:
Status	Count
PASS	8
FAIL	0
BLOCKED	0
NOT RUN	8
Total	16
3. Test Results by Team Member
Test Case	Requirement	Description	Tester	Status
TC-01	US-01	Register with valid university email	Assel	PASS
TC-02	US-01	Register with invalid email	Assel	PASS
TC-04	US-02	Login with valid credentials	Assel	PASS
TC-16	US-02	Prevent unauthenticated access	Assel	PASS
TC-06	US-04	Load available practice topics	Kaussar	PASS
TC-08	US-05	Record and submit a valid audio response	Kaussar	PASS
TC-10	US-08	Receive grammar and vocabulary feedback	Kaussar	PASS
TC-12	US-09	Display pronunciation assessment	Kaussar	PASS
TC-05	US-02	Login with incorrect password	Dilnaz	NOT RUN
TC-09	US-05	Submit invalid or unsupported audio	Dilnaz	NOT RUN
TC-11	US-08	Handle AI analysis failure	Dilnaz	NOT RUN
TC-13	US-09	Handle missing pronunciation results	Dilnaz	NOT RUN
TC-03	US-01	Register with an existing email	Alsu	NOT RUN
TC-07	US-04	Handle an empty topic list	Alsu	NOT RUN
TC-14	US-12	Instructor creates an assignment	Alsu	NOT RUN
TC-15	US-12	Reject an incomplete assignment	Alsu	NOT RUN
Progress
Executed: 8 of 16 (50%)
Passed: 8
Failed: 0
Pass rate of executed tests: 100%
4. Defect Management
Bugs discovered during testing are recorded as GitHub Issues.
Each issue should include:
Clear description.
Steps to reproduce.
Expected and actual results.
Severity (Critical, Major or Minor).
Responsible application area (frontend, backend or auth).
Evidence (screenshot), where available.
No defects were found in the test cases executed so far.
5. Team Responsibilities
Team Member	Responsibility
Assel	Coordinate testing, maintain test cases, monitor issues
Kaussar	Test frontend functionality and fix UI defects
Dilnaz	Test backend, authentication, API and AI integration
Alsu	Validate database structure, data storage and queries
6. Conclusion
Registration, login, protection of private pages, topic loading, audio recording and submission, AI grammar and vocabulary feedback, and pronunciation assessment were tested and passed.
The remaining 8 test cases (backend error handling, database checks and instructor assignments) will be executed by Dilnaz and Alsu, and this report will be updated with their results.

