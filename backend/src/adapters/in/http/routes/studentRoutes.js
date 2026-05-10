const express = require('express');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const createStudentRouter = (studentController) => {
  const router = express.Router();

  // All student routes require authentication
  router.use(authenticate);

  // GET  /api/students          — admin: all; student/teacher: filtered
  router.get('/',            adminOnly, studentController.getAll);

  // GET  /api/students/:id
  router.get('/:id',         adminOnly, studentController.getById);

  // POST /api/students          — admin creates student + user account
  router.post('/',           adminOnly, studentController.create);

  // PUT  /api/students/:id
  router.put('/:id',         adminOnly, studentController.update);

  // DELETE /api/students/:id
  router.delete('/:id',      adminOnly, studentController.delete);

  return router;
};

module.exports = createStudentRouter;
