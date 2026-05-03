const mongoose = require('mongoose');

/**
 * INFRASTRUCTURE MODEL: TimetableEntry
 *
 * Stores one period slot for a given class/section/day combination.
 * A compound unique index prevents duplicate period slots per day.
 */
const timetableEntrySchema = new mongoose.Schema(
  {
    classLevel: {
      type:     Number,
      required: true,
      min:      1,
      max:      12,
    },
    section: {
      type:      String,
      required:  true,
      uppercase: true,
      trim:      true,
      maxlength: 2,
    },
    day: {
      type:     String,
      required: true,
      enum:     ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    period: {
      type:    String,    // e.g. "P1", "1", kept as string for flexibility
      default: null,
      trim:    true,
    },
    time: {
      type:    String,    // e.g. "8:00 - 8:45"
      default: null,
      trim:    true,
    },
    subject: {
      type:     String,
      required: true,
      trim:     true,
    },
    teacher: {
      type:    String,
      default: null,
      trim:    true,
    },
    room: {
      type:    String,
      default: null,
      trim:    true,
    },
    session: {
      type:    String,
      default: '2025-2026',
      trim:    true,
    },
  },
  { timestamps: true }
);

// Fast look-up by class + section
timetableEntrySchema.index({ classLevel: 1, section: 1 });

// Unique period per day for a class/section (prevent scheduling conflicts)
timetableEntrySchema.index(
  { classLevel: 1, section: 1, day: 1, period: 1 },
  { unique: true, sparse: true }   // sparse so null period is allowed without conflict
);

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
