const SectionModel = require('../models/SectionModel');
const { ISectionRepository } = require('../../../../ports/out/repositories');

class MongoSectionRepository extends ISectionRepository {
  async findAll({ classId, search } = {}) {
    const query = {};
    if (classId && classId !== 'all') query.classId = classId;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } },
      ];
    }
    return SectionModel.find(query)
      .populate('teacherId', 'name teacherId department')
      .sort({ classId: 1, section: 1, subject: 1 })
      .lean();
  }

  async findById(id) {
    return SectionModel.findById(id)
      .populate('teacherId', 'name teacherId')
      .lean();
  }

  async findByClassSection(classId, section) {
    return SectionModel.find({ classId, section })
      .populate('teacherId', 'name teacherId')
      .lean();
  }

  // Returns all sections where this teacher is assigned (by teacher _id)
  async findByTeacherId(teacherId) {
    return SectionModel.find({ teacherId }).lean();
  }

  // Returns the full document if exact match exists, or null
  async findExact(classId, section, subject) {
    return SectionModel.findOne({ classId, section, subject }).lean();
  }

  async create(data) {
    const section = new SectionModel(data);
    return section.save();
  }

  async update(id, data) {
    return SectionModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return SectionModel.findByIdAndDelete(id);
  }

  // Kept for backwards compat (used nowhere now but part of the interface)
  async exists(classId, section, subject) {
    return SectionModel.exists({ classId, section, subject });
  }
}

module.exports = MongoSectionRepository;
