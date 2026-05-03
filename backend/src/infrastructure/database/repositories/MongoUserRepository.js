const IUserRepository = require('../../../application/ports/IUserRepository');
const UserModel = require('../models/UserModel');
const User = require('../../../domain/entities/User');

/**
 * INFRASTRUCTURE: MongoUserRepository
 * Implements IUserRepository using Mongoose.
 * Uses parameterized queries — MongoDB driver prevents injection by design.
 */
class MongoUserRepository extends IUserRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      createdAt: doc.createdAt,
    });
  }

  async findByEmail(email) {
    // Mongoose parameterized query — safe from injection
    const doc = await UserModel.findOne({ email: String(email).toLowerCase() }).lean();
    return this._toDomain(doc);
  }

  async findById(id) {
    const doc = await UserModel.findById(id).lean();
    return this._toDomain(doc);
  }

  async create({ name, email, passwordHash, role }) {
    const doc = await UserModel.create({ name, email, passwordHash, role });
    return this._toDomain(doc);
  }

  async update(id, data) {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return this._toDomain(doc);
  }

  async existsByEmail(email) {
    const count = await UserModel.countDocuments({ email: String(email).toLowerCase() });
    return count > 0;
  }
}

module.exports = MongoUserRepository;
