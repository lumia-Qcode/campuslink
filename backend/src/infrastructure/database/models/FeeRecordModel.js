const mongoose = require('mongoose');

/**
 * FEE RECORD MODEL
 * One fee record per student per month.
 * Created automatically when a student is added (for the current month),
 * and by the admin fee-generation endpoint for subsequent months.
 */
const feeRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentCode: { type: String, required: true, trim: true }, // e.g. "STU-001"
    classId:     { type: String, required: true, trim: true },
    section:     { type: String, required: true, trim: true },
    month:       { type: String, required: true, trim: true }, // e.g. "April 2026"
    amount:      { type: Number, required: true, min: 0 },
    status: {
      type:    String,
      enum:    ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    dueDate:  { type: String, default: null, trim: true },
    paidDate: { type: String, default: null, trim: true },
    paidBy:   {
      // admin who marked it paid
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    note: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false }
);

// One fee record per student per month
feeRecordSchema.index({ studentId: 1, month: 1 }, { unique: true });
feeRecordSchema.index({ classId: 1, section: 1, month: 1 });
feeRecordSchema.index({ status: 1 });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);