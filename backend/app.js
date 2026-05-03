const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes    = require('./src/infrastructure/web/routes/authRoutes');
const studentRoutes = require('./src/infrastructure/web/routes/studentRoutes');
const { errorHandler, notFound } = require('./src/infrastructure/web/middleware/errorHandler');

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting — prevents brute-force attacks ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.use(generalLimiter);

// ── Body parsing ──
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent large payload attacks
app.use(express.urlencoded({ extended: false }));

// ── HTTP request logger ──
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CampusLink API is running', timestamp: new Date() });
});

// ── Routes ──
app.use('/api/auth',    authLimiter, authRoutes);
app.use('/api/student', studentRoutes);

// ── 404 handler ──
app.use(notFound);

// ── Global error handler ──
app.use(errorHandler);

module.exports = app;
