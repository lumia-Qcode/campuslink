const mongoose = require('mongoose');

/**
 * INFRASTRUCTURE MODEL: Teacher
 * Stores teacher profile information.
 * Linked 1-to-1 with the User document via userId.
 */
const teacherSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:          { type: String, required: true, trim: true, maxlength: 100 },
    email:         { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    teacherId:     { type: String, required: true, unique: true, trim: true },  // e.g. "T-001"
    subjects:      { type: [String], default: [] },
    classes:       { type: [String], default: [] },   // ['10-A', '10-B']
    department:    { type: String, default: null, trim: true, maxlength: 100 },
    qualification: { type: String, default: null, trim: true, maxlength: 200 },
    joined:        { type: String, default: null, trim: true, maxlength: 10 },
    // Admin-managed fields
    cnic:          { type: String, default: null, trim: true, maxlength: 20 },
    phone:         { type: String, default: null, trim: true, maxlength: 20 },
    dob:           { type: String, default: null, trim: true },
    gender:        { type: String, enum: ['Male', 'Female', 'Other', null], default: null },
    address:       { type: String, default: null, trim: true, maxlength: 500 },
    joinDate:      { type: String, default: null, trim: true },
    assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  },
  { timestamps: true }
);

teacherSchema.index({ userId: 1 });
teacherSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);