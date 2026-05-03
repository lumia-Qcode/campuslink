/**
 * ROUTES: Teacher API
 *
 * All routes require a valid JWT with role = "teacher".
 * Inputs are sanitised by teacherValidators.js before reaching controllers.
 *
 * Base: /api/teacher
 *
 * FIX (materials POST): multer must run BEFORE express-validator body() checks.
 * Previously: uploadMaterialValidators → validate → uploadMaterial
 *             ↑ req.body is empty here because multer hasn't parsed it yet
 * Now:        multerUpload → uploadMaterialValidators → validate → uploadMaterial
 *             ↑ multer populates req.body and req.file first ✓
 */

const express = require('express');
const multer  = require('multer');
const router  = express.Router();

const {
  getDashboard,
  getProfile,
  getStudents,
  getAttendance,
  saveAttendance,
  getMarks,
  saveMarks,
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  getTimetable,
  getAnnouncements,
  getCalendar,
} = require('../controllers/teacherController');

const { authenticate, authorize } = require('../middleware/auth');

const {
  validate,
  studentsQueryValidators,
  attendanceQueryValidators,
  saveAttendanceValidators,
  marksQueryValidators,
  saveMarksValidators,
  uploadMaterialValidators,
  materialIdValidator,
  timetableQueryValidators,
  announcementQueryValidators,
  calendarQueryValidators,
} = require('../middleware/teacherValidators');

// ── Multer config for material uploads ───────────────────────────────────────
// Use memoryStorage so the file buffer is available in the controller.
// Swap to diskStorage or an S3 stream if you need persistent storage.
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB cap — adjust as needed
}).single('file'); // field name the frontend sends the file under

// ── All teacher routes require valid JWT + teacher role ───────────────────────
router.use(authenticate, authorize('teacher'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/profile', getProfile);

// ── Students ──────────────────────────────────────────────────────────────────
router.get('/students', studentsQueryValidators, validate, getStudents);

// ── Attendance ────────────────────────────────────────────────────────────────
router.get('/attendance',  attendanceQueryValidators, validate, getAttendance);
router.post('/attendance', saveAttendanceValidators,  validate, saveAttendance);

// ── Marks ─────────────────────────────────────────────────────────────────────
router.get('/marks',  marksQueryValidators, validate, getMarks);
router.post('/marks', saveMarksValidators,  validate, saveMarks);

// ── Materials ─────────────────────────────────────────────────────────────────
router.get('/materials', getMaterials);

// KEY FIX: multerUpload runs first → populates req.body from multipart fields
//          → express-validator can now read title, subject, class, type, etc.
router.post(
  '/materials',
  multerUpload,               // 1. parse multipart — fills req.body + req.file
  uploadMaterialValidators,   // 2. validate now-populated req.body fields
  validate,                   // 3. halt if any error
  uploadMaterial,             // 4. controller
);

router.delete('/materials/:id', materialIdValidator, validate, deleteMaterial);

// ── Timetable ─────────────────────────────────────────────────────────────────
router.get('/timetable', timetableQueryValidators, validate, getTimetable);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get('/announcements', announcementQueryValidators, validate, getAnnouncements);

// ── Calendar ──────────────────────────────────────────────────────────────────
router.get('/calendar', calendarQueryValidators, validate, getCalendar);

module.exports = router;