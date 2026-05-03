const IAttendanceRepository  = require('../../../application/ports/IAttendanceRepository');
const AttendanceRecordModel  = require('../models/AttendanceRecordModel');
const AttendanceRecord       = require('../../../domain/entities/AttendanceRecord');

/**
 * ADAPTER: MongoAttendanceRepository
 *
 * Concrete implementation of IAttendanceRepository using Mongoose.
 * Translates between Mongoose documents and AttendanceRecord domain entities.
 */
class MongoAttendanceRepository extends IAttendanceRepository {

  // ── Internal mapper ──────────────────────────────────────────────────────

  _toDomain(doc) {
    if (!doc) return null;
    return new AttendanceRecord({
      id:        doc._id.toString(),
      studentId: doc.studentId.toString(),
      date:      doc.date,
      status:    doc.status,
      note:      doc.note,
      createdAt: doc.createdAt,
    });
  }

  // ── IAttendanceRepository implementation ─────────────────────────────────

  async findByStudentId(studentId) {
    const docs = await AttendanceRecordModel
      .find({ studentId: String(studentId) })
      .sort({ date: -1 })     // most-recent first
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findByStudentIdAndStatus(studentId, status) {
    const docs = await AttendanceRecordModel
      .find({ studentId: String(studentId), status })
      .sort({ date: -1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findByStudentIdAndDateRange(studentId, from, to) {
    const docs = await AttendanceRecordModel
      .find({
        studentId: String(studentId),
        date:      { $gte: from, $lte: to },
      })
      .sort({ date: -1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async create(data) {
    const doc = await AttendanceRecordModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await AttendanceRecordModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();
    return this._toDomain(doc);
  }
}

module.exports = MongoAttendanceRepository;
