const ITeacherRepository = require('../../../application/ports/ITeacherRepository');
const TeacherModel       = require('../models/TeacherModel');
const Teacher            = require('../../../domain/entities/Teacher');

/**
 * ADAPTER: MongoTeacherRepository
 * Concrete implementation of ITeacherRepository using Mongoose.
 * All inputs are cast to primitives to prevent NoSQL/injection attacks.
 */
class MongoTeacherRepository extends ITeacherRepository {

  _toDomain(doc) {
    if (!doc) return null;
    return new Teacher({
      id:            doc._id.toString(),
      userId:        doc.userId.toString(),
      name:          doc.name,
      email:         doc.email,
      teacherId:     doc.teacherId,
      subjects:      doc.subjects  || [],
      classes:       doc.classes   || [],
      department:    doc.department,
      qualification: doc.qualification,
      joined:        doc.joined,
      createdAt:     doc.createdAt,
    });
  }

  async findByUserId(userId) {
    const doc = await TeacherModel.findOne({ userId: String(userId) }).lean();
    return this._toDomain(doc);
  }

  async findById(id) {
    const doc = await TeacherModel.findById(String(id)).lean();
    return this._toDomain(doc);
  }

  async findByTeacherId(tid) {
    const doc = await TeacherModel.findOne({ teacherId: String(tid) }).lean();
    return this._toDomain(doc);
  }

  async create(data) {
    const doc = await TeacherModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await TeacherModel.findByIdAndUpdate(String(id), data, { new: true }).lean();
    return this._toDomain(doc);
  }
}

module.exports = MongoTeacherRepository;
