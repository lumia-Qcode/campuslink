const express = require('express');
const { authenticate, adminOnly, requireRole } = require('../middleware/authMiddleware');

const createSectionRouter = (sectionController) => {
  const router = express.Router();

  router.use(authenticate);

  // Teachers and admins can read sections; only admin can write
  router.get('/',       requireRole('admin', 'teacher'), sectionController.getAll);
  router.get('/:id',    requireRole('admin', 'teacher'), sectionController.getById);
  router.post('/',      adminOnly, sectionController.create);
  router.put('/:id',    adminOnly, sectionController.update);
  router.delete('/:id', adminOnly, sectionController.delete);

  return router;
};

module.exports = createSectionRouter;
