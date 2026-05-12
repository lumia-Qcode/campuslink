const FeeModel = require('../models/FeeModel');

class MongoFeeRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.classId)  query.classId = filters.classId;
    if (filters.section)  query.section = filters.section;
    if (filters.status)   query.status  = filters.status;
    if (filters.month)    query.month   = filters.month;
    return FeeModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return FeeModel.findById(id).lean();
  }

  /** Used by student portal — returns all challans for the student, newest first */
  async findByStudent(studentId) {
    return FeeModel.find({ studentId }).sort({ createdAt: -1 }).lean();
  }

  async getDistinctMonths() {
    return FeeModel.distinct('month');
  }

  async create(data) {
    const f = new FeeModel(data);
    return f.save();
  }

  async update(id, data) {
    return FeeModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return FeeModel.findByIdAndDelete(id);
  }

  async generateMonthlyFees(month, dueDate) {
    const StudentModel = require('../models/StudentModel');
    const students = await StudentModel.find({}).lean();
    const ops = students.map(s => ({
      updateOne: {
        filter: { studentId: s._id, month },
        update: {
          $setOnInsert: {
            studentId:   s._id,
            studentName: s.name,
            studentCode: s.studentId,
            classId:     s.classId,
            section:     s.section,
            month,
            amount:      5000,
            dueDate:     new Date(dueDate),
            status:      'Pending',
          },
        },
        upsert: true,
      },
    }));
    if (!ops.length) return { inserted: 0 };
    const result = await FeeModel.bulkWrite(ops);
    return { inserted: result.upsertedCount };
  }
}

module.exports = MongoFeeRepository;
