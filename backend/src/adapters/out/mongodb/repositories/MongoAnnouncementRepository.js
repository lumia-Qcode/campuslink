const AnnouncementModel = require('../models/AnnouncementModel');
const { IAnnouncementRepository } = require('../../../../ports/out/repositories');

class MongoAnnouncementRepository extends IAnnouncementRepository {
  async findAll({ search } = {}) {
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    return AnnouncementModel.find(query)
      .populate('postedBy', 'name username')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id) {
    return AnnouncementModel.findById(id)
      .populate('postedBy', 'name username')
      .lean();
  }

  /**
   * findByRole is the entry point for student/teacher portals.
   * They call GET /api/announcements?role=student
   */
  async findByRole(role) {
    return AnnouncementModel.find({ targetRoles: role })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(data) {
    const ann = new AnnouncementModel(data);
    return ann.save();
  }

  async update(id, data) {
    return AnnouncementModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
  }

  async delete(id) {
    return AnnouncementModel.findByIdAndDelete(id);
  }
}

module.exports = MongoAnnouncementRepository;
