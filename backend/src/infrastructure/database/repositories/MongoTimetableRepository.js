const ITimetableRepository = require('../../../application/ports/ITimetableRepository');
const TimetableEntryModel  = require('../models/TimetableEntryModel');
const TimetableEntry       = require('../../../domain/entities/TimetableEntry');

/**
 * ADAPTER: MongoTimetableRepository
 *
 * Concrete implementation of ITimetableRepository using Mongoose.
 * Translates between Mongoose documents and TimetableEntry domain entities.
 */
class MongoTimetableRepository extends ITimetableRepository {

  // ── Internal mapper ──────────────────────────────────────────────────────

  _toDomain(doc) {
    if (!doc) return null;
    return new TimetableEntry({
      id:         doc._id.toString(),
      classLevel: doc.classLevel,
      section:    doc.section,
      day:        doc.day,
      period:     doc.period,
      time:       doc.time,
      subject:    doc.subject,
      teacher:    doc.teacher,
      room:       doc.room,
      session:    doc.session,
      createdAt:  doc.createdAt,
    });
  }

  // ── ITimetableRepository implementation ──────────────────────────────────

  async findByClassAndSection(classLevel, section) {
    const docs = await TimetableEntryModel
      .find({ classLevel: Number(classLevel), section: String(section).toUpperCase() })
      .sort({ day: 1, period: 1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findByClassSectionAndDay(classLevel, section, day) {
    const docs = await TimetableEntryModel
      .find({
        classLevel: Number(classLevel),
        section:    String(section).toUpperCase(),
        day,
      })
      .sort({ period: 1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async create(data) {
    const doc = await TimetableEntryModel.create(data);
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await TimetableEntryModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();
    return this._toDomain(doc);
  }

  async delete(id) {
    await TimetableEntryModel.findByIdAndDelete(id);
  }
}

module.exports = MongoTimetableRepository;
