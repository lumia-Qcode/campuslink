const express = require('express');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const createMaterialRouter = (materialController) => {
  const router = express.Router();
  router.use(authenticate);

  const teacherAdmin = requireRole('teacher', 'admin');
  const allRoles     = requireRole('teacher', 'admin', 'student');

  router.get('/',         allRoles,     materialController.getAll);
  router.get('/section',  allRoles,     materialController.getByClassSection);
  router.post('/',        teacherAdmin, materialController.upload);
  router.delete('/:id',   teacherAdmin, materialController.delete);

  return router;
};

module.exports = createMaterialRouter;
