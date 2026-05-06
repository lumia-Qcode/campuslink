const mongoose = require('mongoose');

/**
 * SECTION MODEL
 * Represents one subject taught to a specific class-section, by a specific teacher.
 * e.g. Mathematics → Class X → Section A → Teacher T-001
 *
 * A compound unique index prevents duplicate class+section+subject combinations.
 */
const sectionSchema = new mongoose.Schema(
  {
    classId: {
      type:     String,
      required: true,
      trim:     true,
      // e.g. "1","2",...,"X","nursery","playgroup","prenursery"
    },
    classLevel: {
      // numeric mirror used for joins (null for early-ed classes)
      type:    Number,
      default: null,
    },
    section: {
      type:      String,
      required:  true,
      uppercase: true,
      trim:      true,
      maxlength: 2,
    },
    subject: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 100,
    },
    teacherId: {
      // references Teacher._id (ObjectId)
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Teacher',
      default: null,
    },
    teacherName: {
      // denormalised for fast display without joins
      type:    String,
      default: null,
      trim:    true,
    },
    studentCount: {
      type:    Number,
      default: 0,
      min:     0,
    },
    session: {
      type:    String,
      default: '2025-2026',
      trim:    true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Prevent duplicate class+section+subject combos
sectionSchema.index(
  { classId: 1, section: 1, subject: 1, session: 1 },
  { unique: true }
);

sectionSchema.index({ teacherId: 1 });
sectionSchema.index({ classId: 1, section: 1 });

module.exports = mongoose.model('Section', sectionSchema);