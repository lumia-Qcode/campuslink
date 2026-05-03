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
}

module.exports = MongoMarkRepository;
