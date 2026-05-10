const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  studentCode: { type: String },    // e.g. STU-001
  classId:     { type: String, required: true },
  section:     { type: String },
  month:       { type: String, required: true }, // e.g. 'May 2026'
  amount:      { type: Number, required: true },
  dueDate:     { type: Date, required: true },
  status:      { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paidDate:    { type: Date, default: null },
}, { timestamps: true });

feeSchema.index({ studentId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
