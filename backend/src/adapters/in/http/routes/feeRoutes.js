const express = require('express');
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const createFeeRouter = (feeController) => {
  const router = express.Router();

  router.use(authenticate);

  // Admin-only management
  router.get('/',                         adminOnly, feeController.getAll);
  router.get('/months',                   adminOnly, feeController.getMonths);
  router.get('/formula',                  adminOnly, feeController.getFormula);
  router.get('/student/:studentId',       adminOnly, feeController.getStudentFees);
  router.get('/:id',                      adminOnly, feeController.getById);
  router.post('/',                        adminOnly, feeController.create);
  router.post('/generate-monthly',        adminOnly, feeController.generateMonthly);
  router.patch('/:id/mark-paid',          adminOnly, feeController.markAsPaid);
  router.patch('/:id/mark-overdue',       adminOnly, feeController.markAsOverdue);
  router.put('/:id',                      adminOnly, feeController.update);
  router.delete('/:id',                   adminOnly, feeController.delete);

  return router;
};

module.exports = createFeeRouter;
