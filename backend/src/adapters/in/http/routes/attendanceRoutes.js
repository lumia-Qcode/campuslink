const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const createAttendanceRouter = (attendanceController) => {
  const router = express.Router();
  router.use(authenticate);

  const teacherAdmin = requireRole('teacher', 'admin');
  const allRoles     = requireRole('teacher', 'admin', 'student');

  router.get('/',                   allRoles,     attendanceController.getForDate);
  router.get('/dates',              teacherAdmin, attendanceController.getDates);
  router.get('/report',             teacherAdmin, attendanceController.getReport);
  router.get('/student/:studentId', allRoles,     attendanceController.getStudentAttendance);
  router.post('/',                  teacherAdmin, attendanceController.save);

  return router;
};

module.exports = createAttendanceRouter;
