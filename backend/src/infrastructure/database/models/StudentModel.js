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
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    email:     { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    studentId: { type: String, required: true, unique: true, trim: true },
    cnic:      { type: String, default: null, trim: true, maxlength: 20 },
    dob:       { type: String, default: null, trim: true },
    gender:    { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    phone:     { type: String, default: null, trim: true, maxlength: 20 },
    address:   { type: String, default: null, trim: true, maxlength: 300 },
    classId:    { type: String, required: true, trim: true },
    classLevel: { type: Number, default: null },
    section:    { type: String, required: true, uppercase: true, maxlength: 2 },
    rollNo:     { type: Number, default: null },
    session:    { type: String, default: '2025-2026' },
    admissionDate: { type: String, default: null, trim: true },
    fatherName:       { type: String, default: null, trim: true, maxlength: 100 },
    fatherCnic:       { type: String, default: null, trim: true, maxlength: 20 },
    fatherPhone:      { type: String, default: null, trim: true, maxlength: 20 },
    fatherOccupation: { type: String, default: null, trim: true, maxlength: 100 },
    motherName:       { type: String, default: null, trim: true, maxlength: 100 },
    motherPhone:      { type: String, default: null, trim: true, maxlength: 20 },
    feeStatus:  { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    monthlyFee: { type: Number, default: 5000 },
    attendanceOverall:   { type: Number, default: null },
    attendanceBySubject: { type: [subjectAttendanceSchema], default: [] },
    progress:            { type: [progressItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

studentSchema.index({ userId: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ classId: 1, section: 1 });

module.exports = mongoose.model('Student', studentSchema);