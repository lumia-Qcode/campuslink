/**
 * FILE: src/app.js
 * UPDATED: mounts /api/student-portal route
 * Drop-in replacement for existing app.js
 */

const express = require('express');
const cors    = require('cors');
const buildContainer = require('./infrastructure/config/container');
const errorHandler   = require('./adapters/in/http/middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

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
