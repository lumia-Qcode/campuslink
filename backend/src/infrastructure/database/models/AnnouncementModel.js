const mongoose = require('mongoose');

/**
 * INFRASTRUCTURE: AnnouncementModel
 *
 * Mongoose schema for persisting school announcements.
 *
 * Security notes:
 *  - trim: true on all string fields prevents leading/trailing whitespace injection
 *  - maxlength enforced at DB level as a second line of defence (validators.js is first)
 *  - enum constraints prevent invalid tag/role values from reaching the database
 *  - createdAt index enables efficient date-sorted queries
 */
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type:      String,
      required:  [true, 'Description is required'],
      trim:      true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    tag: {
      type:    String,
      enum:    {
        values:  ['urgent', 'event', 'info', 'notice'],
        message: 'Tag must be one of: urgent, event, info, notice',
      },
      default: 'info',
    },
    targetRoles: {
      type:    [String],
      enum:    {
        values:  ['student', 'teacher', 'admin'],
        message: 'Role must be one of: student, teacher, admin',
      },
      default: ['student', 'teacher', 'admin'],
    },
    createdBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
  },
  {
    timestamps: true,         // adds createdAt + updatedAt automatically
    versionKey: false,        // removes __v field
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Primary sort index: latest announcements first
announcementSchema.index({ createdAt: -1 });

// Compound index for role-filtered queries
announcementSchema.index({ targetRoles: 1, createdAt: -1 });

// Compound index for tag-filtered queries
announcementSchema.index({ tag: 1, createdAt: -1 });

// ── Text search index (allows $text queries on title/description) ─────────────
announcementSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Announcement', announcementSchema);
