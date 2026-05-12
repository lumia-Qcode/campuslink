const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createStudentRouter = (studentController) => {
  const router = express.Router();

  // All student routes require authentication
  router.use(authenticate);

  // Teachers and admins can read students
  router.get('/',    requireRole('admin', 'teacher'), studentController.getAll);
  router.get('/:id', requireRole('admin', 'teacher'), studentController.getById);

  // POST /api/students          — admin creates student + user account
  router.post('/',           adminOnly, studentController.create);

  // PUT  /api/students/:id
  router.put('/:id',         adminOnly, studentController.update);

  // DELETE /api/students/:id
  router.delete('/:id',      adminOnly, studentController.delete);

  return router;
};

module.exports = createStudentRouter;
