const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    activity:      { type: String, required: true, trim: true },       // e.g. "Cricket Team"
    participation: { type: String, required: true, trim: true },       // e.g. "Active Member"
    description:   { type: String, default: null },
    startDate:     { type: Date, default: null },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

activitySchema.index({ studentId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
