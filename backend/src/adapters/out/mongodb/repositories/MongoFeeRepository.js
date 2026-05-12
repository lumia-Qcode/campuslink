const FeeModel = require('../models/FeeModel');

class MongoFeeRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.classId) {
      query.classId = filters.classId;
    }

    if (filters.section) {
      query.section = filters.section;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.month) {
      query.month = filters.month;
    }

    return FeeModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id) {
    return FeeModel.findById(id).lean();
  }

  /**
   * Used by student portal
   * Returns all challans for a student
   */
  async findByStudent(studentId) {
    return FeeModel.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getDistinctMonths() {
    return FeeModel.distinct('month');
  }

  async create(data) {
    const fee = new FeeModel(data);
    return fee.save();
  }

  async update(id, data) {
    return FeeModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    ).lean();
  }

  async delete(id) {
    return FeeModel.findByIdAndDelete(id);
  }

  async generateMonthlyFees(month, dueDate) {
    const StudentModel = require('../models/StudentModel');

    const students = await StudentModel.find({}).lean();

    const ops = students.map(student => ({
      updateOne: {
        filter: {
          studentId: student._id,
          month,
        },

        update: {
          $setOnInsert: {
            studentId: student._id,
            studentName: student.name,
            studentCode: student.studentId,
            classId: student.classId,
            section: student.section,
            month,
            amount: 5000,
            dueDate: new Date(dueDate),
            status: 'Pending',
          },
        },

        upsert: true,
      },
    }));

    if (!ops.length) {
      return { inserted: 0 };
    }

    const result = await FeeModel.bulkWrite(ops);

    return {
      inserted: result.upsertedCount,
    };
  }
}

module.exports = MongoFeeRepository;