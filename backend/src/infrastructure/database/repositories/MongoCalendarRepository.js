const ICalendarRepository = require('../../../application/ports/ICalendarRepository');
const CalendarEventModel  = require('../models/CalendarEventModel');
const CalendarEvent       = require('../../../domain/entities/CalendarEvent');

/**
 * ADAPTER: MongoCalendarRepository
 *
 * Concrete implementation of ICalendarRepository using Mongoose.
 * Translates between Mongoose documents and CalendarEvent domain entities.
 */
class MongoCalendarRepository extends ICalendarRepository {

  // ── Internal mapper ──────────────────────────────────────────────────────

  _toDomain(doc) {
    if (!doc) return null;
    return new CalendarEvent({
      id:          doc._id.toString(),
      title:       doc.title,
      date:        doc.date,
      type:        doc.type,
      description: doc.description,
      targetRoles: doc.targetRoles,
      createdAt:   doc.createdAt,
    });
  }

  // ── ICalendarRepository implementation ───────────────────────────────────

  async findByRole(role) {
    const docs = await CalendarEventModel
      .find({ targetRoles: role })
      .sort({ date: 1 })   // chronological order
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findByRoleAndDateRange(role, from, to) {
    const docs = await CalendarEventModel
      .find({
        targetRoles: role,
        date:        { $gte: from, $lte: to },
      })
      .sort({ date: 1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  async findById(id) {
    const doc = await CalendarEventModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async create(data) {
    const doc = await CalendarEventModel.create(data);
    return this._toDomain(doc);
  }
}

module.exports = MongoCalendarRepository;
