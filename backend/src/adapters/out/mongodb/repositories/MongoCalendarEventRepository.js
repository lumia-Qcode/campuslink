const CalendarEventModel = require('../models/CalendarEventModel');

class MongoCalendarEventRepository {
  async findAll() {
    return CalendarEventModel.find().sort({ date: 1 }).lean();
  }

  async findById(id) {
    return CalendarEventModel.findById(id).lean();
  }

  /**
   * used by student portal calendar.
   * Returns teacher/admin events + the student's own events.
   */
  async findForStudent(studentUserId) {
    return CalendarEventModel.find({
      $or: [
        { role: { $in: ['teacher', 'admin'] } },
        { role: 'student', createdBy: studentUserId },
      ],
    })
      .sort({ date: 1 })
      .lean();
  }

  async create(data) {
    const e = new CalendarEventModel(data);
    return e.save();
  }

  async delete(id) {
    return CalendarEventModel.findByIdAndDelete(id);
  }
}

module.exports = MongoCalendarEventRepository;
