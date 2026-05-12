
const express = require('express');
const cors    = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const buildContainer = require('./infrastructure/config/container');
const errorHandler   = require('./adapters/in/http/middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Security: Sanitize against NoSQL injection ($, . in keys) ────────────────
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized key "${key}" in ${req.method} ${req.url}`);
  },
}));

// ── Security: Strip prototype pollution patterns ──────────────────────────────
app.use((req, _res, next) => {
  const strip = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        delete obj[key];
      } else {
        strip(obj[key]);
      }
    }
  };
  strip(req.body);
  strip(req.query);
  strip(req.params);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
const {
  authRouter,
  studentRouter,
  teacherRouter,
  sectionRouter,
  feeRouter,
  announcementRouter,
  timetableRouter,
  attendanceRouter,
  marksRouter,
  materialRouter,
  calendarEventRouter,
  studentPortalRouter,  // NEW
} = buildContainer();

app.use('/api/auth',            authRouter);
app.use('/api/students',        studentRouter);
app.use('/api/teachers',        teacherRouter);
app.use('/api/sections',        sectionRouter);
app.use('/api/fees',            feeRouter);
app.use('/api/announcements',   announcementRouter);
app.use('/api/timetable',       timetableRouter);
app.use('/api/attendance',      attendanceRouter);
app.use('/api/marks',           marksRouter);
app.use('/api/materials',       materialRouter);
app.use('/api/calendar-events', calendarEventRouter);
app.use('/api/student-portal',  studentPortalRouter);  // NEW

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;