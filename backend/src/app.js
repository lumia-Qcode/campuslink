const express  = require('express');
const cors     = require('cors');
const buildContainer = require('./infrastructure/config/container');
const errorHandler   = require('./adapters/in/http/middleware/errorHandler');

function createApp() {
  const app = express();

  // ── Global Middleware ──
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Health Check ──
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── Routes (wired via DI container) ──
  const {
    authRouter,
    studentRouter,
    teacherRouter,
    sectionRouter,
    feeRouter,
    announcementRouter,
    timetableRouter,
  } = buildContainer();

  app.use('/api/auth',          authRouter);
  app.use('/api/students',      studentRouter);
  app.use('/api/teachers',      teacherRouter);
  app.use('/api/sections',      sectionRouter);
  app.use('/api/fees',          feeRouter);
  app.use('/api/announcements', announcementRouter);
  app.use('/api/timetable',     timetableRouter);

  // ── 404 Handler ──
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
  });

  // ── Error Handler ──
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
