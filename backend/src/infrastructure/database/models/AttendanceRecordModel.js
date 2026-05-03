const mongoose = require('mongoose');

/**
 * INFRASTRUCTURE MODEL: AttendanceRecord
 *
 * Stores one attendance entry per student per school day.
 * A compound unique index on (studentId, date) prevents duplicate entries.
 */
const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },
    date: {
      type:     Date,
      required: true,
    },
    status: {
      type:     String,
      required: true,
      enum:     ['Present', 'Absent', 'Late', 'Leave'],
    },
    note: {
      type:    String,
      default: null,
      trim:    true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One record per student per day
attendanceRecordSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Range queries by date are common
attendanceRecordSchema.index({ studentId: 1, date: -1 });

// Filtering by status
attendanceRecordSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
