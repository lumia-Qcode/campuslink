const { body, query, param, validationResult } = require('express-validator');

// ── Shared validation result handler ─────────────────────────────────────────
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Students ──────────────────────────────────────────────────────────────────
exports.createStudentValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('classId').trim().notEmpty().withMessage('Class is required'),
  body('section').trim().notEmpty().withMessage('Section is required').isLength({ max: 2 }),
  body('rollNo').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Roll number must be a positive integer'),
  body('dob').optional({ nullable: true }).isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('fatherName').optional().trim().isLength({ max: 100 }),
  body('fatherPhone').optional().trim().isLength({ max: 20 }),
];

exports.updateStudentValidators = [
  param('id').isMongoId().withMessage('Invalid student ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('feeStatus').optional().isIn(['Paid', 'Pending', 'Overdue']),
];

// ── Teachers ──────────────────────────────────────────────────────────────────
exports.createTeacherValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required').isLength({ max: 100 }),
  body('qualification').optional().trim().isLength({ max: 200 }),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('joinDate').optional({ nullable: true }).isISO8601().withMessage('Join date must be a valid date'),
];

exports.assignSectionValidators = [
  param('id').isMongoId().withMessage('Invalid teacher ID'),
  body('sectionId').isMongoId().withMessage('Invalid section ID'),
];

// ── Sections ──────────────────────────────────────────────────────────────────
exports.createSectionValidators = [
  body('classId').trim().notEmpty().withMessage('Class is required'),
  body('section').trim().notEmpty().withMessage('Section letter is required').isLength({ max: 2 }),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 100 }),
  body('teacherId').optional({ nullable: true }).isMongoId().withMessage('Invalid teacher ID'),
];

// ── Timetable ─────────────────────────────────────────────────────────────────
exports.saveTimetableEntryValidators = [
  body('classId').trim().notEmpty().withMessage('Class is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('day').isIn(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']).withMessage('Invalid day'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('time').optional().trim(),
  body('period').optional().trim(),
];

// ── Announcements ─────────────────────────────────────────────────────────────
exports.createAnnouncementValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('tag').optional().isIn(['urgent','event','info','notice']),
  body('targetRoles').optional().isArray(),
];

// ── Financial Aid ─────────────────────────────────────────────────────────────
exports.createAidValidators = [
  body('studentCode').trim().notEmpty().withMessage('Student code is required'),
  body('type').isIn(['scholarship','discount','sibling','merit','need']).withMessage('Invalid type'),
  body('requestedAmount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 2000 }),
];

exports.reviewAidValidators = [
  param('id').isMongoId().withMessage('Invalid application ID'),
  body('status').isIn(['pending','approved','rejected','reviewing']).withMessage('Invalid status'),
  body('approvedAmount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('reviewNote').optional().trim().isLength({ max: 1000 }),
];

// ── Fees ──────────────────────────────────────────────────────────────────────
exports.generateFeesValidators = [
  body('month').trim().notEmpty().withMessage('Month is required'),
];