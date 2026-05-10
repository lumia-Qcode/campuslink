const express = require('express');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const createSectionRouter = (sectionController) => {
  const router = express.Router();

  router.use(authenticate);

  router.get('/',       adminOnly, sectionController.getAll);
  router.get('/:id',    adminOnly, sectionController.getById);
  router.post('/',      adminOnly, sectionController.create);
  router.put('/:id',    adminOnly, sectionController.update);
  router.delete('/:id', adminOnly, sectionController.delete);

  return router;
};

module.exports = createSectionRouter;
