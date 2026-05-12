const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  classId:      { type: String, required: true },
  section:      { type: String, required: true },
  subject:      { type: String, required: true, trim: true },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  studentCount: { type: Number, default: 0 },
}, { timestamps: true });

sectionSchema.index({ classId: 1, section: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
