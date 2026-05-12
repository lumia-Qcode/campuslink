const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createAnnouncementRouter = (announcementController) => {
  const router = express.Router();

  router.use(authenticate);

  // All authenticated roles can read; only admin can write.
  router.get(
    '/',
    requireRole('admin', 'student', 'teacher'),
    announcementController.getAll
  );

  router.get(
    '/:id',
    requireRole('admin', 'student', 'teacher'),
    announcementController.getById
  );

  // Only admin or teacher can create / edit / delete announcements
  router.post('/',      requireRole('admin', 'teacher'), announcementController.create);
  router.put('/:id',    requireRole('admin', 'teacher'), announcementController.update);
  router.delete('/:id', requireRole('admin', 'teacher'), announcementController.delete);

  return router;
};

module.exports = createAnnouncementRouter;
