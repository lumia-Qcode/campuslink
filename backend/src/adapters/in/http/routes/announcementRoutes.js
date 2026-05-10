const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createAnnouncementRouter = (announcementController) => {
  const router = express.Router();

  router.use(authenticate);

  // GET /api/announcements
  //   ?role=student  → student portal (future)
  //   ?role=teacher  → teacher portal (future)
  //   no role param  → admin sees all
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

  // Only admin can create / edit / delete announcements
  router.post('/',      adminOnly, announcementController.create);
  router.put('/:id',    adminOnly, announcementController.update);
  router.delete('/:id', adminOnly, announcementController.delete);

  return router;
};

module.exports = createAnnouncementRouter;
