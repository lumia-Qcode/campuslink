const TeacherModel = require('../models/TeacherModel');
const { ITeacherRepository } = require('../../../../ports/out/repositories');

class MongoTeacherRepository extends ITeacherRepository {
  async findAll({ department, search } = {}) {
    const query = {};
    if (department && department !== 'all') query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    return TeacherModel.find(query)
      .populate('assignedSections', 'classId section subject')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id) {
    return TeacherModel.findById(id)
      .populate('assignedSections', 'classId section subject')
      .lean();
  }

  async findByUserId(userId) {
    return TeacherModel.findOne({ userId })
      .populate('assignedSections', 'classId section subject')
      .lean();
  }

  async findByTeacherId(teacherId) {
    return TeacherModel.findOne({ teacherId }).lean();
  }

  async create(data) {
    const teacher = new TeacherModel(data);
    return teacher.save();
  }

  async update(id, data) {
    return TeacherModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return TeacherModel.findByIdAndDelete(id);
  }

  async count() {
    return TeacherModel.countDocuments();
  }

  async getLastTeacherNumber() {
    const last = await TeacherModel.findOne().sort({ createdAt: -1 }).lean();
    if (!last) return 0;
    const match = last.teacherId.match(/T-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // ── FIX: add/remove a section ObjectId in the teacher's assignedSections ──
  async addAssignedSection(teacherId, sectionId) {
    return TeacherModel.findByIdAndUpdate(
      teacherId,
      { $addToSet: { assignedSections: sectionId } },
      { new: true }
    ).lean();
  }

  async removeAssignedSection(teacherId, sectionId) {
    return TeacherModel.findByIdAndUpdate(
      teacherId,
      { $pull: { assignedSections: sectionId } },
      { new: true }
    ).lean();
  }
}

module.exports = MongoTeacherRepository;
