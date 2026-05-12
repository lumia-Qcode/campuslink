const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 'student' added so personal student events can be stored
  role:      { type: String, enum: ['admin', 'teacher', 'student'], default: 'teacher' },
  date:      { type: String, required: true }, // 'YYYY-MM-DD'
  event:     { type: String, required: true, trim: true },
  tag:       { type: String, enum: ['exam', 'holiday', 'event', 'reminder', 'other'], default: 'other' },
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
