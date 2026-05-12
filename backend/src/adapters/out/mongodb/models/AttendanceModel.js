const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId:   { type: String, required: true },
  section:   { type: String, required: true },
  date:      { type: String, required: true }, // 'YYYY-MM-DD'
  status:    { type: String, enum: ['Present', 'Absent', 'Late', 'Leave'], required: true },
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1, classId: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
