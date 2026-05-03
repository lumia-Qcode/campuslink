const express = require('express');
const router  = express.Router();

const {
  getDashboard,
  getMarks,
  getProfile,
  getAttendance,
  getTimetable,
  getCalendar,
  getDiscipline,
  getMaterials,
  getActivities,
  getAnnouncements,
  getFees,
} = require('../controllers/studentController');

const { authenticate, authorize } = require('../middleware/auth');

const {
  marksQueryValidators,
  attendanceQueryValidators,
  timetableQueryValidators,
  calendarQueryValidators,
  materialsQueryValidators,
  announcementQueryValidators,
  validate,
} = require('../middleware/validators');

// All student routes require a valid JWT with role = "student"
router.use(authenticate, authorize('student'));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);

// Marks
router.get('/marks', marksQueryValidators, validate, getMarks);

// Attendance
router.get('/attendance', attendanceQueryValidators, validate, getAttendance);

// Timetable
router.get('/timetable', timetableQueryValidators, validate, getTimetable);

// Calendar
router.get('/calendar', calendarQueryValidators, validate, getCalendar);

// Discipline
router.get('/discipline', getDiscipline);

// Materials
router.get('/materials', materialsQueryValidators, validate, getMaterials);

// Activities
router.get('/activities', getActivities);

// Announcements — tag is whitelisted via announcementQueryValidators
router.get('/announcements', announcementQueryValidators, validate, getAnnouncements);

// Fees
router.get('/fees', getFees);

module.exports = router;
