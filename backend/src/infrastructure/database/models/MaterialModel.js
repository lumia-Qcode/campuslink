const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    subject:     { type: String, required: true, trim: true },
    type:        { type: String, enum: ['PDF', 'DOC', 'PPT', 'VIDEO', 'LINK', 'OTHER'], default: 'PDF' },
    fileUrl:     { type: String, default: null },       // URL to the actual file
    downloadUrl: { type: String, default: null },       // separate download link if needed
    size:        { type: String, default: null },       // e.g. "2.3 MB"
    // Who can see it — 'all' means every student, otherwise specific class/section
    targetClass:   { type: Number, default: null },    // null = all classes
    targetSection: { type: String, default: null },    // null = all sections
    uploadedBy:  { type: String, default: 'Teacher' }, // teacher name or role
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

materialSchema.index({ subject: 1 });
materialSchema.index({ targetClass: 1, targetSection: 1 });

module.exports = mongoose.model('Material', materialSchema);
