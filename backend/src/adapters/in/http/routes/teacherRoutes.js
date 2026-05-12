const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createTeacherRouter = (teacherController) => {
  const router = express.Router();

  router.use(authenticate);

  // Teacher can fetch their own profile
  router.get('/me', requireRole('teacher', 'admin'), teacherController.getMe);

  router.get('/',       adminOnly, teacherController.getAll);
  router.get('/:id',    adminOnly, teacherController.getById);
  router.post('/',      adminOnly, teacherController.create);
  router.put('/:id',    adminOnly, teacherController.update);
  router.delete('/:id', adminOnly, teacherController.delete);

  return router;
};

module.exports = createTeacherRouter;
