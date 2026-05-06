const mongoose = require('mongoose');

/**
 * FINANCIAL AID APPLICATION MODEL
 * Students (or admin on their behalf) submit financial aid requests.
 * Admin reviews and approves / rejects them.
 */
const financialAidSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },
    studentName:    { type: String, required: true, trim: true },
    studentCode:    { type: String, required: true, trim: true }, // e.g. STU-005
    classId:        { type: String, required: true, trim: true },
    section:        { type: String, required: true, trim: true },
    type: {
      type:     String,
      required: true,
      enum:     ['scholarship', 'discount', 'sibling', 'merit', 'need'],
    },
    appliedDate:      { type: String, required: true, trim: true },
    requestedAmount:  { type: Number, required: true, min: 0 },
    approvedAmount:   { type: Number, default: null },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'reviewing'],
      default: 'pending',
    },
    reason:     { type: String, required: true, trim: true, maxlength: 2000 },
    documents:  { type: [String], default: [] },
    reviewNote: { type: String, default: '', trim: true, maxlength: 1000 },
    reviewedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

financialAidSchema.index({ studentId: 1 });
financialAidSchema.index({ status: 1 });
financialAidSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FinancialAid', financialAidSchema);