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

  async delete(id) {
    await AttendanceRecordModel.findByIdAndDelete(String(id));
  }

  /**
   * Upsert one attendance record.
   * If a record for (studentId, date) already exists it is overwritten.
   * Uses MongoDB's findOneAndUpdate with upsert to avoid race-condition
   * duplicates — safe against NoSQL injection because all inputs are cast
   * to primitives before the query is built.
   */
  async upsertForStudent(studentId, date, status, note) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const doc = await AttendanceRecordModel.findOneAndUpdate(
      {
        studentId: String(studentId),
        date:      dayStart,
      },
      {
        $set: {
          status: String(status),
          note:   note ? String(note).slice(0, 500) : null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return this._toDomain(doc);
  }

  /**
   * Return all records for a list of students on a specific date.
   * The date is normalised to midnight UTC to match stored values.
   */
  async findByStudentIdsAndDate(studentIds, date) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);

    // Cast every id to string (prevents operator injection)
    const safeIds = studentIds.map(id => String(id));

    const docs = await AttendanceRecordModel.find({
      studentId: { $in: safeIds },
      date:      { $gte: dayStart, $lte: dayEnd },
    }).lean();

    return docs.map(d => this._toDomain(d));
  }
}

module.exports = MongoAttendanceRepository;
