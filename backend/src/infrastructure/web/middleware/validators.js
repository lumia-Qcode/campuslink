/**
 * MIDDLEWARE: Validators
 *
 * Uses express-validator to sanitise and validate all incoming query params
 * and request bodies BEFORE they reach the use-case or repository layer.
 *
 * ── SQL / NoSQL Injection Protection ─────────────────────────────────────────
 * MongoDB is susceptible to NoSQL operator injection (e.g. passing { $gt: '' }
 * as a query parameter). These validators are the FIRST line of defence:
 *
 *  • isIn()          – whitelists allowed string values, rejecting operators
 *  • trim()          – strips surrounding whitespace
 *  • escape()        – HTML-encodes special characters in body params
 *  • isLength()      – caps string size, preventing oversized payloads
 *  • isEmail()       – normalises email format, rejecting injection attempts
 *  • isMongoId()     – validates ObjectId format where IDs are expected
 *
 * Every query param is .optional() so missing values are acceptable; if
 * present they MUST match the whitelist or the request is rejected with 400.
 *
 * A second guard lives in MongoAnnouncementRepository._buildFilter() which
 * casts all values to primitives regardless.
 */

const { body, query, param, validationResult } = require('express-validator');

// ── Core middleware: collect and return validation errors ─────────────────────

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────

const loginValidators = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
    .trim(),
];

const signupValidators = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
    .trim(),
  body('role')
    .isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin'),
];

// ── Announcement Validators ───────────────────────────────────────────────────

const VALID_TAGS = ['urgent', 'event', 'info', 'notice', 'all', 'All'];

/** Used on GET /api/student/announcements?tag=urgent */
const announcementQueryValidators = [
  query('tag')
    .optional()
    .isIn(VALID_TAGS)
    .withMessage(`Tag must be one of: ${VALID_TAGS.filter(t => t !== 'all' && t !== 'All').join(', ')}`),
];

/** Used on POST /api/admin/announcements (create) */
const createAnnouncementValidators = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters')
    .trim()
    .escape(),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters')
    .trim()
    .escape(),

  body('tag')
    .notEmpty().withMessage('Tag is required')
    .isIn(['urgent', 'event', 'info', 'notice'])
    .withMessage('Tag must be one of: urgent, event, info, notice'),

  body('targetRoles')
    .optional()
    .isArray().withMessage('targetRoles must be an array')
    .custom((arr) => {
      const valid = ['student', 'teacher', 'admin'];
      const invalid = arr.filter(r => !valid.includes(r));
      if (invalid.length > 0) throw new Error(`Invalid roles: ${invalid.join(', ')}`);
      return true;
    }),
];

/** Used on DELETE /api/admin/announcements/:id */
const announcementIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid announcement ID format'),
];

// ── Marks Query Validator ─────────────────────────────────────────────────────

const marksQueryValidators = [
  query('component')
    .optional()
    .isIn(['All', 'MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'])
    .withMessage('Invalid component filter'),
];

// ── Attendance Query Validators ───────────────────────────────────────────────

const VALID_STATUSES = ['All', 'Present', 'Absent', 'Late', 'Leave'];

const attendanceQueryValidators = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  query('month')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Month filter must be a non-empty string (e.g. "March 2026")'),
];

// ── Timetable Query Validators ────────────────────────────────────────────────

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timetableQueryValidators = [
  query('day')
    .optional()
    .isIn(VALID_DAYS)
    .withMessage(`Day must be one of: ${VALID_DAYS.join(', ')}`),
];

// ── Calendar Query Validators ─────────────────────────────────────────────────

const VALID_EVENT_TYPES = ['All', 'exam', 'holiday', 'event', 'meeting', 'activity', 'other'];

const calendarQueryValidators = [
  query('month')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Month filter must be a non-empty string (e.g. "April 2026")'),

  query('type')
    .optional()
    .isIn(VALID_EVENT_TYPES)
    .withMessage(`Type must be one of: ${VALID_EVENT_TYPES.join(', ')}`),
];

// ── Materials Query Validators ────────────────────────────────────────────────

const materialsQueryValidators = [
  query('subject')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject filter must be a non-empty string'),
];

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  validate,
  loginValidators,
  signupValidators,
  // Announcements
  announcementQueryValidators,
  createAnnouncementValidators,
  announcementIdValidator,
  // Student domain
  marksQueryValidators,
  attendanceQueryValidators,
  timetableQueryValidators,
  calendarQueryValidators,
  materialsQueryValidators,
};
