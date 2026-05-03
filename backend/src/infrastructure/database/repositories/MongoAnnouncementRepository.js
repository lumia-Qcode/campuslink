/**
 * INFRASTRUCTURE ADAPTER: MongoAnnouncementRepository
 *
 * Concrete implementation of IAnnouncementRepository using Mongoose.
 *
 * ── SQL / NoSQL Injection Protection ─────────────────────────────────────────
 * MongoDB is not vulnerable to SQL injection (it doesn't use SQL), but it IS
 * vulnerable to NoSQL operator injection (e.g. passing { $gt: '' } as a filter
 * value). We guard against this by:
 *
 *  1. Whitelisting every query value through express-validator in validators.js
 *     before it ever reaches this repository.
 *  2. Coercing all filter values to primitive strings here (String(value)).
 *  3. Using Mongoose's strict schema — unknown fields are silently dropped,
 *     operators like $where are never evaluated in a find() context.
 *  4. Never interpolating user input into raw query strings.
 *  5. lean() queries return plain JS objects, not executable Mongoose documents,
 *     minimising the attack surface further.
 *
 * Following Hexagonal Architecture, this class implements IAnnouncementRepository
 * and lives entirely in the infrastructure layer — the application core never
 * imports Mongoose or MongoDB directly.
 */

const AnnouncementModel = require('../models/AnnouncementModel');
const Announcement      = require('../../../domain/entities/Announcement');

class MongoAnnouncementRepository {

  // ── Private: map Mongoose doc → domain entity ────────────────────────────

  _toDomain(doc) {
    if (!doc) return null;
    return new Announcement({
      id:          doc._id.toString(),
      title:       doc.title,
      description: doc.description,
      tag:         doc.tag,
      targetRoles: doc.targetRoles,
      createdBy:   doc.createdBy ? doc.createdBy.toString() : null,
      createdAt:   doc.createdAt,
    });
  }

  // ── Private: build a safe Mongoose filter object ─────────────────────────

  _buildFilter(filters = {}) {
    const query = {};

    // Whitelist-driven: only allow known string values, cast to String to
    // prevent object/operator injection (e.g. { $gt: '' })
    if (filters.tag && filters.tag !== 'all' && filters.tag !== 'All') {
      query.tag = String(filters.tag).toLowerCase();
    }

    if (filters.role) {
      // targetRoles is an array field — $in is the correct operator here
      query.targetRoles = { $in: [String(filters.role)] };
    }

    return query;
  }

  // ── IAnnouncementRepository implementation ────────────────────────────────

  /**
   * Returns the most recent `limit` announcements across all roles.
   * @param {number} [limit=5]
   * @returns {Promise<Announcement[]>}
   */
  async findRecent(limit = 5) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    const docs = await AnnouncementModel
      .find()
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  /**
   * Returns all announcements matching optional filters.
   * @param {{ tag?: string }} [filters]
   * @returns {Promise<Announcement[]>}
   */
  async findAll(filters = {}) {
    const query = this._buildFilter(filters);
    const docs  = await AnnouncementModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  /**
   * Returns all announcements visible to a specific role.
   * @param {string} role – 'student' | 'teacher' | 'admin'
   * @param {{ tag?: string }} [filters]
   * @returns {Promise<Announcement[]>}
   */
  async findByRole(role, filters = {}) {
    const query = this._buildFilter({ ...filters, role });
    const docs  = await AnnouncementModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => this._toDomain(d));
  }

  /**
   * Persists a new announcement.
   * Input is validated by the Announcement domain entity constructor before
   * this method is called, providing a second layer of validation.
   *
   * @param {{ title: string, description: string, tag: string, targetRoles: string[], createdBy?: string }} data
   * @returns {Promise<Announcement>}
   */
  async create(data) {
    // Domain entity validates business rules before we touch the DB
    const entity = new Announcement({
      id:          'pending',
      title:       data.title,
      description: data.description,
      tag:         data.tag || 'info',
      targetRoles: data.targetRoles || ['student', 'teacher', 'admin'],
      createdBy:   data.createdBy || null,
      createdAt:   new Date(),
    });

    const doc = await AnnouncementModel.create({
      title:       entity.title,
      description: entity.description,
      tag:         entity.tag,
      targetRoles: entity.targetRoles,
      createdBy:   entity.createdBy,
    });

    return this._toDomain(doc);
  }

  /**
   * Deletes an announcement by its ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteById(id) {
    // Mongoose ObjectId validation prevents injection via malformed IDs
    const result = await AnnouncementModel.findByIdAndDelete(String(id));
    return result !== null;
  }
}

module.exports = MongoAnnouncementRepository;
