const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  content:      { type: String, required: true },
  postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoles:  {
    type: [String],
    enum: ['student', 'teacher', 'admin'],
    default: ['student', 'teacher', 'admin'],
  },
  targetClasses: { type: [String], default: [] },
  tag:   { type: String, enum: ['urgent','event','info','notice','holiday'], default: 'info' },
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
