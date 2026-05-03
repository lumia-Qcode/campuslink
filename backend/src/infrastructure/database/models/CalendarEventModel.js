const mongoose = require('mongoose');

/**
 * MONGOOSE MODEL: CalendarEvent
 * Stores academic calendar entries (exams, holidays, ceremonies, etc.)
 * that are visible to specific roles.
 */
const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Event title is required'],
      trim:     true,
      maxlength: [200, 'Title must be ≤ 200 characters'],
    },
    date: {
      type:     Date,
      required: [true, 'Event date is required'],
      index:    true,
    },
    type: {
      type:    String,
      enum:    ['exam', 'holiday', 'event', 'meeting', 'activity', 'other'],
      default: 'other',
    },
    description: {
      type:    String,
      trim:    true,
      default: null,
    },
    /** Roles that should see this event */
    targetRoles: {
      type:    [String],
      enum:    ['student', 'teacher', 'admin'],
      default: ['student', 'teacher', 'admin'],
    },
  },
  {
    timestamps: true,
    collection: 'calendarevents',
  }
);

// Compound index: quickly fetch events by role + date range
calendarEventSchema.index({ targetRoles: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
