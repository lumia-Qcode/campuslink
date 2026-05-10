const TimetableModel = require('../models/TimetableModel');
const { ITimetableRepository } = require('../../../../ports/out/repositories');

class MongoTimetableRepository extends ITimetableRepository {
  async findAll({ classId, section } = {}) {
    const query = {};
    if (classId) query.classId = classId;
    if (section) query.section = section;
    return TimetableModel.find(query)
      .populate('teacherId', 'name teacherId')
      .sort({ day: 1, period: 1 })
      .lean();
  }

  async findByClassSection(classId, section) {
    return TimetableModel.find({ classId, section })
      .populate('teacherId', 'name teacherId')
      .sort({ day: 1, period: 1 })
      .lean();
  }

  async findByTeacher(teacherId) {
    return TimetableModel.find({ teacherId })
      .sort({ day: 1, period: 1 })
      .lean();
  }

  async create(data) {
    const entry = new TimetableModel(data);
    return entry.save();
  }

  async update(id, data) {
    return TimetableModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return TimetableModel.findByIdAndDelete(id);
  }

  async deleteByClassSection(classId, section) {
    return TimetableModel.deleteMany({ classId, section });
  }

  async upsert(classId, section, day, period, data) {
    return TimetableModel.findOneAndUpdate(
      { classId, section, day, period },
      data,
      { upsert: true, new: true }
    ).lean();
  }
}

module.exports = MongoTimetableRepository;
