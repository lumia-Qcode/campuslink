
const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const createStudentPortalRouter = (studentPortalController) => {
  const router = express.Router();
  router.use(authenticate);
  router.use(requireRole('student'));

  // ── Profile ──────────────────────────────────────────────
  // GET /api/student-portal/me  → own profile
  router.get('/me', studentPortalController.getMyProfile);

  // ── Attendance ───────────────────────────────────────────
  // GET /api/student-portal/attendance  → all attendance records for the student
  router.get('/attendance', studentPortalController.getMyAttendance);

  // ── Marks ────────────────────────────────────────────────
  // GET /api/student-portal/marks  → all marks for the student
  router.get('/marks', studentPortalController.getMyMarks);

  // ── Fees ─────────────────────────────────────────────────
  // GET /api/student-portal/fees  → fee challans assigned by admin
  router.get('/fees', studentPortalController.getMyFees);

  // ── Timetable ────────────────────────────────────────────
  // GET /api/student-portal/timetable  → timetable for student's class/section
  router.get('/timetable', studentPortalController.getMyTimetable);

  // ── Materials ────────────────────────────────────────────
  // GET /api/student-portal/materials  → materials uploaded by teachers for student's section
  router.get('/materials', studentPortalController.getMyMaterials);

  // ── Announcements ────────────────────────────────────────
  // GET /api/student-portal/announcements  → teacher + admin announcements visible to student
  router.get('/announcements', studentPortalController.getMyAnnouncements);

  // ── Calendar Events ──────────────────────────────────────
  // GET /api/student-portal/calendar  → teacher/admin events + student's own events
  router.get('/calendar', studentPortalController.getMyCalendarEvents);

  // POST /api/student-portal/calendar  → student adds a personal event
  router.post('/calendar', studentPortalController.addCalendarEvent);

  // DELETE /api/student-portal/calendar/:id  → student deletes their own event only
  router.delete('/calendar/:id', studentPortalController.deleteCalendarEvent);

  return router;
};

module.exports = createStudentPortalRouter;
