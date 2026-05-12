const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');

const createAuthRouter = (authController) => {
  const router = express.Router();

  // POST /api/auth/login
  router.post('/login', authController.login);

  // GET /api/auth/me  (protected)
  router.get('/me', authenticate, authController.me);

  return router;
};

module.exports = createAuthRouter;
