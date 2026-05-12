const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  title:     { type: String, required: true, trim: true },
  subject:   { type: String, required: true, trim: true },
  classId:   { type: String, required: true },
  section:   { type: String, required: true },
  fileType:  { type: String, default: 'PDF' },
  fileSize:  { type: String, default: '' },
  fileUrl:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
