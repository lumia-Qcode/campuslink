const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const createCalendarEventRouter = (calendarEventController) => {
  const router = express.Router();
  router.use(authenticate);

  const allRoles     = requireRole('teacher', 'admin', 'student');
  const teacherAdmin = requireRole('teacher', 'admin');

  router.get('/',       allRoles,     calendarEventController.getAll);
  router.post('/',      teacherAdmin, calendarEventController.create);
  router.delete('/:id', teacherAdmin, calendarEventController.delete);

  return router;
};

module.exports = createCalendarEventRouter;
