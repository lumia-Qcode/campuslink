const express = require('express');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const createTeacherRouter = (teacherController) => {
  const router = express.Router();

  router.use(authenticate);

  router.get('/',       adminOnly, teacherController.getAll);
  router.get('/:id',    adminOnly, teacherController.getById);
  router.post('/',      adminOnly, teacherController.create);
  router.put('/:id',    adminOnly, teacherController.update);
  router.delete('/:id', adminOnly, teacherController.delete);

  return router;
};

module.exports = createTeacherRouter;
