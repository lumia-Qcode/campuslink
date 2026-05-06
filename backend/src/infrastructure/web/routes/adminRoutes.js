/**
 * ADMIN ROUTES
 * Base: /api/admin
 * All routes require a valid JWT with role = "admin"
 */

const express = require('express');
const router  = express.Router();

const {
  getDashboard,
  // Students
  listStudents, getStudent, createStudent, updateStudent, deleteStudent,
  // Teachers
  listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher,
  assignSection, unassignSection,
  // Sections
  listSections, createSection, updateSection, deleteSection,
  // Timetable
  getTimetable, saveTimetableEntry, deleteTimetableEntry, saveBulkTimetable,
  // Fees
  listFees, markFeePaid, generateMonthlyFees,
  // Announcements
  listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  // Financial Aid
  listFinancialAid, createFinancialAid, reviewFinancialAid, deleteFinancialAid,
} = require('../controllers/adminController');

const { authenticate, authorize } = require('../middleware/auth');

const {
  validate,
  createStudentValidators, updateStudentValidators,
  createTeacherValidators, assignSectionValidators,
  createSectionValidators,
  saveTimetableEntryValidators,
  createAnnouncementValidators,
  createAidValidators, reviewAidValidators,
  generateFeesValidators,
} = require('../middleware/adminValidators');

// All admin routes require admin JWT
router.use(authenticate, authorize('admin'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ── Students ──────────────────────────────────────────────────────────────────
router.get   ('/students',     listStudents);
router.get   ('/students/:id', getStudent);
router.post  ('/students',     createStudentValidators, validate, createStudent);
router.patch ('/students/:id', updateStudentValidators, validate, updateStudent);
router.delete('/students/:id', deleteStudent);

// ── Teachers ──────────────────────────────────────────────────────────────────
router.get   ('/teachers',                    listTeachers);
router.get   ('/teachers/:id',                getTeacher);
router.post  ('/teachers',                    createTeacherValidators, validate, createTeacher);
router.patch ('/teachers/:id',                updateTeacher);
router.delete('/teachers/:id',                deleteTeacher);
router.post  ('/teachers/:id/assign-section', assignSectionValidators, validate, assignSection);
router.post  ('/teachers/:id/unassign-section', unassignSection);

// ── Sections ──────────────────────────────────────────────────────────────────
router.get   ('/sections',     listSections);
router.post  ('/sections',     createSectionValidators, validate, createSection);
router.patch ('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// ── Timetable ─────────────────────────────────────────────────────────────────
router.get   ('/timetable',         getTimetable);
router.post  ('/timetable',         saveTimetableEntryValidators, validate, saveTimetableEntry);
router.post  ('/timetable/bulk',    saveBulkTimetable);
router.delete('/timetable/:id',     deleteTimetableEntry);

// ── Fees ──────────────────────────────────────────────────────────────────────
router.get  ('/fees',                  listFees);
router.patch('/fees/:id/mark-paid',    markFeePaid);
router.post ('/fees/generate',         generateFeesValidators, validate, generateMonthlyFees);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get   ('/announcements',     listAnnouncements);
router.post  ('/announcements',     createAnnouncementValidators, validate, createAnnouncement);
router.patch ('/announcements/:id', createAnnouncementValidators, validate, updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// ── Financial Aid ─────────────────────────────────────────────────────────────
router.get   ('/financial-aid',         listFinancialAid);
router.post  ('/financial-aid',         createAidValidators, validate, createFinancialAid);
router.patch ('/financial-aid/:id',     reviewAidValidators, validate, reviewFinancialAid);
router.delete('/financial-aid/:id',     deleteFinancialAid);

module.exports = router;