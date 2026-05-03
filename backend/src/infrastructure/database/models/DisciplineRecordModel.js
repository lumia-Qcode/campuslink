const mongoose = require('mongoose');

/**
 * MONGOOSE MODEL: DisciplineRecord
 * Stores individual conduct/discipline entries for students.
 * Each record carries a severity level and optional remarks.
 */
const disciplineRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: [true, 'studentId is required'],
      index:    true,
    },
    date: {
      type:     Date,
      required: [true, 'Date is required'],
      default:  Date.now,
    },
    remarks: {
      type:     String,
      trim:     true,
      required: [true, 'Remarks are required'],
    },
    severity: {
      type:    String,
      enum:    ['good', 'warning', 'serious'],
      default: 'good',
    },
    /** Teacher or admin who issued this record */
    issuedBy: {
      type:    String,
      trim:    true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'disciplinerecords',
  }
);

// Quickly fetch all records for a student, sorted by date
disciplineRecordSchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('DisciplineRecord', disciplineRecordSchema);
