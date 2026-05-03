const IDisciplineRepository  = require('../../../application/ports/IDisciplineRepository');
const DisciplineRecordModel  = require('../models/DisciplineRecordModel');
const DisciplineRecord       = require('../../../domain/entities/DisciplineRecord');

/**
 * ADAPTER: MongoDisciplineRepository
 *
 * Concrete implementation of IDisciplineRepository using Mongoose.
 * Translates between Mongoose documents and DisciplineRecord domain entities.
 */
class MongoDisciplineRepository extends IDisciplineRepository {

  // ── Internal mapper ──────────────────────────────────────────────────────

  _toDomain(doc) {
    if (!doc) return null;
    return new DisciplineRecord({
      id:        doc._id.toString(),
      studentId: doc.studentId.toString(),
      date:      doc.date,
      remarks:   doc.remarks,
      severity:  doc.severity,
      issuedBy:  doc.issuedBy,
      createdAt: doc.createdAt,
    });
  }

  // ── IDisciplineRepository implementation ─────────────────────────────────

  async findByStudentId(studentId) {
    const docs = await DisciplineRecordModel
      .find({ studentId: String(studentId) })
      .sort({ date: -1 })   // most-recent first
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findLatestByStudentId(studentId) {
    const doc = await DisciplineRecordModel
      .findOne({ studentId: String(studentId) })
      .sort({ date: -1 })
      .lean();
    return this._toDomain(doc);
  }

  async create(data) {
    const doc = await DisciplineRecordModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await DisciplineRecordModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();
    return this._toDomain(doc);
  }
}

module.exports = MongoDisciplineRepository;
