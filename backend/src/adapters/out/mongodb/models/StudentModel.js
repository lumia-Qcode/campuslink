const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId:        { type: String, required: true, unique: true },
  name:             { type: String, required: true, trim: true },
  username:         { type: String, required: true, unique: true, trim: true, lowercase: true },
  email:            { type: String, trim: true, lowercase: true },
  cnic:             { type: String, trim: true },
  dob:              { type: Date },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'] },
  phone:            { type: String, trim: true },
  address:          { type: String, trim: true },
  fatherName:       { type: String, trim: true },
  fatherCnic:       { type: String, trim: true },
  fatherPhone:      { type: String, trim: true },
  fatherOccupation: { type: String, trim: true },
  motherName:       { type: String, trim: true },
  motherPhone:      { type: String, trim: true },
  classId:          { type: String, required: true },
  section:          { type: String, required: true },
  rollNo:           { type: Number },
  admissionDate:    { type: Date, default: Date.now },
  feeStatus:        { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
