const mongoose = require('mongoose');

const subjectAttendanceSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  percentage: { type: Number, default: 0 },
  color:      { type: String, default: '#4f8ef7' },
}, { _id: false });

const progressItemSchema = new mongoose.Schema({
  category: { type: String },
  rating:   { type: String },
  level:    { type: String },
}, { _id: false });

const studentSchema = new mongoose.Schema(
  {
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:               { type: String, required: true, trim: true },
    email:              { type: String, required: true, trim: true, lowercase: true },
    studentId:          { type: String, required: true, unique: true },
    classLevel:         { type: Number, required: true, min: 1, max: 12 },
    section:            { type: String, required: true, uppercase: true, maxlength: 2 },
    rollNo:             { type: Number, default: null },
    session:            { type: String, default: '2025-2026' },
    feeStatus:          { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
    attendanceOverall:  { type: Number, default: null },
    attendanceBySubject:{ type: [subjectAttendanceSchema], default: [] },
    progress:           { type: [progressItemSchema], default: [] },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Student', studentSchema);
