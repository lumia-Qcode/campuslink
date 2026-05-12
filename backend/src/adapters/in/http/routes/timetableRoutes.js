const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createTimetableRouter = (timetableController) => {
  const router = express.Router();

  router.use(authenticate);

  // Read: admin, teachers, students (future portals just call these)
  router.get(
    '/',
    requireRole('admin', 'teacher', 'student'),
    timetableController.getAll
  );

  router.get(
    '/class/:classId/section/:section',
    requireRole('admin', 'teacher', 'student'),
    timetableController.getByClassSection
  );

  router.get(
    '/teacher/:teacherId',
    requireRole('admin', 'teacher'),
    timetableController.getByTeacher
  );

  // Write: admin only
  router.post('/',              adminOnly, timetableController.addEntry);
  router.post('/save',          adminOnly, timetableController.saveTimetable);
  router.put('/:id',            adminOnly, timetableController.updateEntry);
  router.delete('/:id',         adminOnly, timetableController.deleteEntry);

  return router;
};

module.exports = createTimetableRouter;
