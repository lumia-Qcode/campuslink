const StudentModel = require('../models/StudentModel');

class MongoStudentRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.classId)  query.classId  = filters.classId;
    if (filters.section)  query.section  = filters.section;
    if (filters.search) {
      query.$or = [
        { name:      { $regex: filters.search, $options: 'i' } },
        { studentId: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return StudentModel.find(query).sort({ name: 1 }).lean();
  }

  async findById(id) {
    return StudentModel.findById(id).lean();
  }

  async findByStudentId(sid) {
    return StudentModel.findOne({ studentId: sid }).lean();
  }

  /** NEW — used by student portal to resolve profile from JWT userId */
  async findByUserId(userId) {
    return StudentModel.findOne({ userId }).lean();
  }

  async findByClassSection(classId, section) {
    return StudentModel.find({ classId, section }).sort({ rollNo: 1 }).lean();
  }

  async create(data) {
    const s = new StudentModel(data);
    return s.save();
  }

  async update(id, data) {
    return StudentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }

  async delete(id) {
    return StudentModel.findByIdAndDelete(id);
  }

  async count() {
    return StudentModel.countDocuments();
  }

  async getLastStudentNumber() {
    const students = await StudentModel.find({}, { studentId: 1 }).lean();
    let max = 0;
    for (const s of students) {
      const m = s.studentId?.match(/STU-(\d+)/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return max;
  }
}

module.exports = MongoStudentRepository;
