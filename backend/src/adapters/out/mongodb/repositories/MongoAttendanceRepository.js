const AttendanceModel = require('../models/AttendanceModel');

class MongoAttendanceRepository {
  // Save (upsert) a batch of records for a class/section/date
  async saveAttendanceBatch(records) {
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date: r.date, classId: r.classId, section: r.section },
        update: { $set: r },
        upsert: true,
      },
    }));
    return AttendanceModel.bulkWrite(ops);
  }

  // Get all attendance for a class/section/date
  async findByClassDate(classId, section, date) {
    return AttendanceModel.find({ classId, section, date })
      .populate('studentId', 'name rollNo studentId')
      .lean();
  }

  // Get all dates that have attendance for a class/section
  async findDatesForClass(classId, section) {
    const docs = await AttendanceModel.distinct('date', { classId, section });
    return docs.sort();
  }

  // Get attendance records for a specific student
  async findByStudent(studentId) {
    return AttendanceModel.find({ studentId }).sort({ date: -1 }).lean();
  }

  // Get attendance report: for multiple dates, for a class
  async findByClassDateRange(classId, section, fromDate, toDate) {
    return AttendanceModel.find({
      classId, section,
      date: { $gte: fromDate, $lte: toDate },
    })
      .populate('studentId', 'name rollNo studentId')
      .lean();
  }
}

module.exports = MongoAttendanceRepository;
