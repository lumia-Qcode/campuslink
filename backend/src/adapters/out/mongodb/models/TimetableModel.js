const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classId:   { type: String, required: true },
  section:   { type: String, required: true },
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  period:    { type: Number, required: true, min: 1, max: 10 },
  subject:   { type: String, required: true, trim: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  startTime: { type: String },  // 'HH:MM'
  endTime:   { type: String },
}, { timestamps: true });

timetableSchema.index({ classId: 1, section: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
