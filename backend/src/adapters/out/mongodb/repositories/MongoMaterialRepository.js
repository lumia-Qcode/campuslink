const MaterialModel = require('../models/MaterialModel');

class MongoMaterialRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.classId) query.classId = filters.classId;
    if (filters.section) query.section = filters.section;
    if (filters.subject) query.subject = filters.subject;
    return MaterialModel.find(query)
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  /** Used by student portal — all materials for the student's class/section */
  async findByClassSection(classId, section) {
    return MaterialModel.find({ classId, section })
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(data) {
    const m = new MaterialModel(data);
    return m.save();
  }

  async delete(id) {
    return MaterialModel.findByIdAndDelete(id);
  }
}

module.exports = MongoMaterialRepository;
