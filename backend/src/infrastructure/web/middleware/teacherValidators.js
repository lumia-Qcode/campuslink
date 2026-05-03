/**
 * MIDDLEWARE: Teacher Validators
 *
 * Validates and sanitises all teacher route inputs.
 * Protects against NoSQL injection using the same strategy as validators.js:
 *   • isIn()      – whitelist-only values
 *   • trim()      – strip whitespace
 *   • escape()    – HTML-encode body strings
 *   • isLength()  – cap string sizes
 *   • isMongoId() – validate ObjectId format
 *   • isArray()   – assert array type for bulk inputs
 *   • isInt()     – numeric validation for marks/classLevel
 */

const { body, query, param, validationResult } = require('express-validator');

// ── Core validate helper ──────────────────────────────────────────────────────

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

// ── Shared whitelists ─────────────────────────────────────────────────────────

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const VALID_COMPONENTS = ['MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'];

const VALID_STATUSES = ['Present', 'Absent', 'Late', 'Leave'];

const VALID_MATERIAL_TYPES = ['PDF', 'DOC', 'PPT', 'VIDEO', 'LINK', 'OTHER'];

const VALID_TAGS = ['urgent', 'event', 'info', 'notice', 'all', 'All'];

const VALID_EVENT_TYPES = ['All', 'exam', 'holiday', 'event', 'meeting', 'activity', 'other'];

// ── Class label helper — e.g. "10-A", "9-B" ──────────────────────────────────

const classLabelValidator = (field, location = query) =>
  location(field)
    .notEmpty().withMessage(`${field} is required`)
    .isString()
    .trim()
    .matches(/^\d{1,2}-[A-Z]$/).withMessage(`${field} must be in format like "10-A" or "9-B"`)
    .isLength({ max: 5 }).withMessage(`${field} too long`);

// ── Student / Class query validators ─────────────────────────────────────────

const studentsQueryValidators = [
  classLabelValidator('class'),
];

// ── Attendance query validators ───────────────────────────────────────────────

const attendanceQueryValidators = [
  classLabelValidator('class'),
  query('date')
    .optional()
    .isISO8601().withMessage('date must be a valid ISO date (YYYY-MM-DD)')
    .trim(),
];

// ── Save attendance body validators ──────────────────────────────────────────

const saveAttendanceValidators = [
  body('class')
    .notEmpty().withMessage('class is required')
    .isString().trim()
    .matches(/^\d{1,2}-[A-Z]$/).withMessage('class must be in format like "10-A"'),

  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('date must be a valid ISO date (YYYY-MM-DD)')
    .trim(),

  body('records')
    .isArray({ min: 1 }).withMessage('records must be a non-empty array'),

  body('records.*.studentId')
    .notEmpty().withMessage('Each record must have a studentId')
    .isMongoId().withMessage('studentId must be a valid MongoDB ObjectId'),

  body('records.*.status')
    .notEmpty().withMessage('Each record must have a status')
    .isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('records.*.note')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('note must not exceed 500 characters')
    .escape(),
];

// ── Marks query validators ────────────────────────────────────────────────────

const marksQueryValidators = [
  classLabelValidator('class'),

  query('subject')
    .notEmpty().withMessage('subject is required')
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('subject must be 1–100 characters'),

  query('component')
    .notEmpty().withMessage('component is required')
    .isIn(VALID_COMPONENTS).withMessage(`component must be one of: ${VALID_COMPONENTS.join(', ')}`),
];

// ── Save marks body validators ────────────────────────────────────────────────

const saveMarksValidators = [
  body('class')
    .notEmpty().withMessage('class is required')
    .isString().trim()
    .matches(/^\d{1,2}-[A-Z]$/).withMessage('class must be in format like "10-A"'),

  body('subject')
    .notEmpty().withMessage('subject is required')
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('subject must be 1–100 characters')
    .escape(),

  body('component')
    .notEmpty().withMessage('component is required')
    .isIn(VALID_COMPONENTS).withMessage(`component must be one of: ${VALID_COMPONENTS.join(', ')}`),

  body('entries')
    .isArray({ min: 1 }).withMessage('entries must be a non-empty array'),

  body('entries.*.studentId')
    .notEmpty().withMessage('Each entry must have a studentId')
    .isMongoId().withMessage('studentId must be a valid MongoDB ObjectId'),

  body('entries.*.marks')
    .notEmpty().withMessage('marks is required')
    .isFloat({ min: 0 }).withMessage('marks must be a non-negative number'),

  body('entries.*.total')
    .optional()
    .isFloat({ min: 1 }).withMessage('total must be at least 1'),

  body('entries.*.examDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('examDate must be a valid ISO date'),
];

// ── Material upload body validators ──────────────────────────────────────────

const uploadMaterialValidators = [
  body('title')
    .notEmpty().withMessage('title is required')
    .isString().trim()
    .isLength({ min: 1, max: 300 }).withMessage('title must be 1–300 characters')
    .escape(),

  body('subject')
    .notEmpty().withMessage('subject is required')
    .isString().trim()
    .isLength({ min: 1, max: 100 }).withMessage('subject must be 1–100 characters')
    .escape(),

  body('type')
    .optional()
    .isIn(VALID_MATERIAL_TYPES).withMessage(`type must be one of: ${VALID_MATERIAL_TYPES.join(', ')}`),

  body('fileUrl')
    .optional({ nullable: true })
    .isURL().withMessage('fileUrl must be a valid URL')
    .isLength({ max: 1000 }),

  body('downloadUrl')
    .optional({ nullable: true })
    .isURL().withMessage('downloadUrl must be a valid URL')
    .isLength({ max: 1000 }),

  body('size')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 20 }).withMessage('size too long'),

  body('targetClass')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 12 }).withMessage('targetClass must be an integer 1–12'),

  body('targetSection')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 5 }).withMessage('targetSection too long')
    .matches(/^[A-Z]$/).withMessage('targetSection must be a single uppercase letter'),
];

// ── Material delete validator ─────────────────────────────────────────────────

const materialIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid material ID format'),
];

// ── Timetable query validators ────────────────────────────────────────────────

const timetableQueryValidators = [
  query('day')
    .optional()
    .isIn(VALID_DAYS).withMessage(`day must be one of: ${VALID_DAYS.join(', ')}`),
];

// ── Announcement query validators ─────────────────────────────────────────────

const announcementQueryValidators = [
  query('tag')
    .optional()
    .isIn(VALID_TAGS).withMessage(`tag must be one of: ${VALID_TAGS.filter(t => t !== 'all' && t !== 'All').join(', ')}`),
];

// ── Calendar query validators ─────────────────────────────────────────────────

const calendarQueryValidators = [
  query('month')
    .optional()
    .isString().trim()
    .isLength({ min: 1, max: 30 }).withMessage('month must be a non-empty string (e.g. "May 2026")'),

  query('type')
    .optional()
    .isIn(VALID_EVENT_TYPES).withMessage(`type must be one of: ${VALID_EVENT_TYPES.join(', ')}`),
];

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
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
};
