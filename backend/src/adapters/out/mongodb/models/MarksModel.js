const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId:    { type: String, required: true },
  section:    { type: String, required: true },
  subject:    { type: String, required: true, trim: true },
  component:  { type: String, required: true }, // 'MidTerm - I', 'Final', etc.
  marks:      { type: Number, required: true, min: 0 },
  total:      { type: Number, required: true, default: 100 },
}, { timestamps: true });

marksSchema.index({ studentId: 1, subject: 1, component: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
