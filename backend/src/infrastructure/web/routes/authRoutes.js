const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidators, signupValidators, validate } = require('../middleware/validators');

// POST /api/auth/signup
router.post('/signup', signupValidators, validate, signup);

// POST /api/auth/login
router.post('/login', loginValidators, validate, login);

// GET /api/auth/me  — protected
router.get('/me', authenticate, getMe);

module.exports = router;
