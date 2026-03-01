# Academic Performance Evaluation Portal (APEP)

## Current State

New project. No existing code.

## Requested Changes (Diff)

### Add

**Home Page**
- College logo, portal name, navigation header
- Four role login buttons: Student, Teacher, HOD, Admin
- Announcements/notice board section showing recent departmental notices
- Footer with contact info and department details

**Authentication**
- Role-based login for 4 roles: Student, Teacher, HOD, Admin
- Each login uses ID/code + password
- Forgot password flow (email reset)
- After login, redirect to role-specific dashboard

**Student Dashboard**
- Profile section (name, roll number, semester, course)
- Subject cards grid (subject name + teacher name)
- Subject detail page with:
  - Attendance percentage bar
  - Internal marks table (multiple exams/components)
  - Downloadable assignments
  - Assignment upload (submit work)
  - View uploaded answer sheet
  - Rechecking request button
  - Timetable section
  - Notices panel for that subject

**Teacher Dashboard**
- Subject/semester/class selector
- Student list for selected subject
- Mark attendance (daily, per-student)
- Upload internal marks form
- Upload answer sheets (PDF)
- Assignment upload panel
- View submitted assignments
- Approve/reject rechecking requests
- Timetable upload

**HOD Dashboard**
- Teacher list with status
- Student database
- Attendance shortage report (students below threshold)
- Subject-wise performance statistics
- Notice/event posting panel (posts visible to all)

**Admin Dashboard**
- Create/manage student, teacher, HOD accounts
- Course and semester setup
- System logs viewer
- Database export/backup trigger
- Full record access across all roles

**Data Models**
- Users: id, role (student/teacher/hod/admin), name, email, passwordHash, createdAt
- Students: userId, rollNumber, course, semester, section
- Teachers: userId, teacherCode, subjects
- Subjects: id, name, code, teacherId, semester, section
- Attendance: subjectId, studentId, date, status (present/absent)
- Marks: subjectId, studentId, examType, maxMarks, obtainedMarks
- Assignments: id, subjectId, title, description, fileUrl, dueDate, createdAt
- Submissions: id, assignmentId, studentId, fileUrl, submittedAt
- AnswerSheets: id, subjectId, examType, studentId, fileUrl
- RecheckRequests: id, answersheetId, studentId, status, reason, teacherNote
- Notices: id, postedBy, role, title, content, subjectId (nullable), createdAt
- Timetable: subjectId, day, startTime, endTime, room

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan

1. Select components: authorization (role-based), blob-storage (PDF/file uploads)
2. Generate Motoko backend with all data models, CRUD operations, role-gated queries
3. Build landing page with 4 login portals and notice board
4. Build shared auth flow (login forms per role, session management)
5. Build Student dashboard: subject cards, subject detail with attendance/marks/assignments/rechecking
6. Build Teacher dashboard: class management, attendance marking, marks upload, assignment management
7. Build HOD dashboard: analytics panels, attendance reports, notice posting
8. Build Admin dashboard: user management, course setup, logs
9. Wire blob-storage for file uploads (assignments, answer sheets, timetables)
10. Add sample/seed data for demo purposes
