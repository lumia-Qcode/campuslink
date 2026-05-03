const IStudentRepository = require('../../../application/ports/IStudentRepository');
const StudentModel = require('../models/StudentModel');
const Student = require('../../../domain/entities/Student');

class MongoStudentRepository extends IStudentRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Student({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      name: doc.name,
      email: doc.email,
      studentId: doc.studentId,
      classLevel: doc.classLevel,
      section: doc.section,
      rollNo: doc.rollNo,
      session: doc.session,
      feeStatus: doc.feeStatus,
      attendanceOverall: doc.attendanceOverall,
      attendanceBySubject: doc.attendanceBySubject,
      progress: doc.progress,
      createdAt: doc.createdAt,
    });
  }

  async findByUserId(userId) {
    const doc = await StudentModel.findOne({ userId: String(userId) }).lean();
    return this._toDomain(doc);
  }

  async findById(id) {
    const doc = await StudentModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async findByStudentId(studentId) {
    const doc = await StudentModel.findOne({ studentId: String(studentId) }).lean();
    return this._toDomain(doc);
  }

  async create(data) {
    const doc = await StudentModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await StudentModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return this._toDomain(doc);
  }

  /**
   * Return all students for a specific class level + section.
   * Inputs are cast to primitives to prevent NoSQL injection.
   */
  async findByClassAndSection(classLevel, section) {
    const docs = await StudentModel.find({
      classLevel: Number(classLevel),
      section:    String(section).toUpperCase(),
    }).sort({ rollNo: 1 }).lean();
    return docs.map(d => this._toDomain(d));
  }

  /**
   * Parse a class label like "10-A" and delegate to findByClassAndSection.
   */
  async findByClassLabel(classLabel) {
    const parts = String(classLabel).split('-');
    if (parts.length < 2) return [];
    const classLevel = Number(parts[0]);
    const section    = parts.slice(1).join('-').toUpperCase();
    if (isNaN(classLevel)) return [];
    return this.findByClassAndSection(classLevel, section);
  }
}

module.exports = MongoStudentRepository;
