const FeeModel = require('../models/FeeModel');
const StudentModel = require('../models/StudentModel');
const Fee = require('../../../../domain/entities/Fee');
const { IFeeRepository } = require('../../../../ports/out/repositories');

class MongoFeeRepository extends IFeeRepository {
  async findAll({ month, classId, status, search } = {}) {
    const query = {};
    if (month && month !== 'all') query.month = month;
    if (classId && classId !== 'all') query.classId = classId;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } },
      ];
    }
    return FeeModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return FeeModel.findById(id).lean();
  }

  async findByStudent(studentId) {
    return FeeModel.find({ studentId }).sort({ createdAt: -1 }).lean();
  }

  async create(data) {
    const fee = new FeeModel(data);
    return fee.save();
  }

  async update(id, data) {
    return FeeModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return FeeModel.findByIdAndDelete(id);
  }

  /**
   * Generate fee records for all students for a given month.
   * Uses Fee.calculateAmount() domain logic for amounts.
   */
  async generateMonthlyFees(month, dueDate) {
    const students = await StudentModel.find().lean();
    const results = [];

    for (const student of students) {
      const exists = await FeeModel.findOne({ studentId: student._id, month });
      if (exists) continue;

      const amount = Fee.calculateAmount(student.classId);
      const fee = new FeeModel({
        studentId:   student._id,
        studentName: student.name,
        studentCode: student.studentId,
        classId:     student.classId,
        section:     student.section,
        month,
        amount,
        dueDate: new Date(dueDate),
        status: 'Pending',
      });
      await fee.save();
      results.push(fee);
    }
    return results;
  }

  async getMonths() {
    return FeeModel.distinct('month');
  }
}

module.exports = MongoFeeRepository;
