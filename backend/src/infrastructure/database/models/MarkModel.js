const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject:   { type: String, required: true, trim: true },
    component: {
      type: String,
      required: true,
      enum: ['MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'],
    },
    marks:     { type: Number, required: true, min: 0 },
    total:     { type: Number, required: true, min: 1, default: 100 },
    examDate:  { type: Date, default: null },
  },
  { timestamps: true }
);

markSchema.index({ studentId: 1 });
markSchema.index({ studentId: 1, component: 1 });

module.exports = mongoose.model('Mark', markSchema);
