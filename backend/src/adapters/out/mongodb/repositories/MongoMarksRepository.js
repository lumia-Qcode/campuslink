const MarksModel = require('../models/MarksModel');

class MongoMarksRepository {
  async findByClassSubjectComponent(classId, section, subject, component) {
    return MarksModel.find({ classId, section, subject, component })
      .populate('studentId', 'name rollNo studentId')
      .lean();
  }

  async findByClassSection(classId, section) {
    return MarksModel.find({ classId, section })
      .populate('studentId', 'name rollNo studentId')
      .lean();
  }

  /** Used by student portal — all marks for this student, with teacher ref */
  async findByStudent(studentId) {
    return MarksModel.find({ studentId })
      .populate('teacherId', 'name')
      .sort({ subject: 1, component: 1 })
      .lean();
  }

  async saveBatch(records) {
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, subject: r.subject, component: r.component },
        update: { $set: r },
        upsert: true,
      },
    }));
    return MarksModel.bulkWrite(ops);
  }
}

module.exports = MongoMarksRepository;
