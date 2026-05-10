const StudentModel = require('../models/StudentModel');
const { IStudentRepository } = require('../../../../ports/out/repositories');

class MongoStudentRepository extends IStudentRepository {
  async findAll({ classId, section, search } = {}) {
    const query = {};
    if (classId && classId !== 'all') query.classId = classId;
    if (section && section !== 'all') query.section = section;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    return StudentModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return StudentModel.findById(id).lean();
  }

  async findByStudentId(studentId) {
    return StudentModel.findOne({ studentId }).lean();
  }

  async findByClassSection(classId, section) {
    return StudentModel.find({ classId, section }).lean();
  }

  async create(data) {
    const student = new StudentModel(data);
    return student.save();
  }

  async update(id, data) {
    return StudentModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return StudentModel.findByIdAndDelete(id);
  }

  async count() {
    return StudentModel.countDocuments();
  }

  async getLastStudentNumber() {
    const last = await StudentModel.findOne().sort({ createdAt: -1 }).lean();
    if (!last) return 0;
    const match = last.studentId.match(/STU-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

module.exports = MongoStudentRepository;
