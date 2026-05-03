const IMarkRepository = require('../../../application/ports/IMarkRepository');
const MarkModel = require('../models/MarkModel');
const Mark = require('../../../domain/entities/Mark');

class MongoMarkRepository extends IMarkRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Mark({
      id: doc._id.toString(),
      studentId: doc.studentId.toString(),
      subject: doc.subject,
      component: doc.component,
      marks: doc.marks,
      total: doc.total,
      examDate: doc.examDate,
      createdAt: doc.createdAt,
    });
  }

  async findByStudentId(studentId) {
    const docs = await MarkModel.find({ studentId: String(studentId) })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findByStudentIdAndComponent(studentId, component) {
    const docs = await MarkModel.find({
      studentId: String(studentId),
      component: String(component),
    }).lean();
    return docs.map(d => this._toDomain(d));
  }

  async findById(id) {
    const doc = await MarkModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async create(data) {
    const doc = await MarkModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await MarkModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return this._toDomain(doc);
  }

  async delete(id) {
    await MarkModel.findByIdAndDelete(id);
  }

  /**
   * Upsert a mark for a student / subject / component triplet.
   * Prevents duplicate mark entries for the same exam component.
   * All inputs are cast to primitives to guard against injection.
   */
  async upsertMark(studentId, subject, component, marks, total, examDate) {
    const doc = await MarkModel.findOneAndUpdate(
      {
        studentId: String(studentId),
        subject:   String(subject),
        component: String(component),
      },
      {
        $set: {
          marks:    Number(marks),
          total:    Number(total),
          examDate: examDate ? new Date(examDate) : null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return this._toDomain(doc);
  }

  /**
   * Return marks for a list of students for a given subject + component.
   * All ids are cast to strings to prevent operator injection.
   */
  async findByStudentIdsSubjectAndComponent(studentIds, subject, component) {
    const safeIds = studentIds.map(id => String(id));
    const docs = await MarkModel.find({
      studentId: { $in: safeIds },
      subject:   String(subject),
      component: String(component),
    }).lean();
    return docs.map(d => this._toDomain(d));
  }
}

module.exports = MongoMarkRepository;
