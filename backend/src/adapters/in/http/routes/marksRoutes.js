const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const createMarksRouter = (marksController) => {
  const router = express.Router();
  router.use(authenticate);

  const teacherAdmin = requireRole('teacher', 'admin');
  const allRoles     = requireRole('teacher', 'admin', 'student');

  router.get('/',                   teacherAdmin, marksController.get);
  router.get('/class',              teacherAdmin, marksController.getForClass);
  router.get('/student/:studentId', allRoles,     marksController.getForStudent);
  router.post('/',                  teacherAdmin, marksController.save);

  return router;
};

module.exports = createMarksRouter;
