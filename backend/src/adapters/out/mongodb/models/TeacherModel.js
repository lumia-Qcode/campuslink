const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId:        { type: String, required: true, unique: true },
  name:             { type: String, required: true, trim: true },
  username:         { type: String, required: true, unique: true, trim: true, lowercase: true },
  email:            { type: String, trim: true, lowercase: true },
  cnic:             { type: String, trim: true },
  dob:              { type: Date },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'] },
  phone:            { type: String, trim: true },
  address:          { type: String, trim: true },
  qualification:    { type: String, trim: true },
  department:       { type: String, trim: true },
  joinDate:         { type: Date, default: Date.now },
  assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
