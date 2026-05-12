const AnnouncementModel = require('../models/AnnouncementModel');

class MongoAnnouncementRepository {
  async findAll(filters = {}) {
    const query = {};
    if (filters.role)    query.targetRoles = filters.role;
    if (filters.pinned)  query.pinned = true;
    return AnnouncementModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return AnnouncementModel.findById(id).lean();
  }

  async findByRole(role) {
    return AnnouncementModel.find({ targetRoles: role }).sort({ createdAt: -1 }).lean();
  }

  /**
   * NEW — used by student portal.
   * Returns announcements that:
   *   - target the 'student' role, AND
   *   - either have no class filter (targetClasses is empty) OR include the student's classId
   */
  async findForStudent(classId) {
    return AnnouncementModel.find({
      targetRoles: 'student',
      $or: [
        { targetClasses: { $size: 0 } },
        { targetClasses: classId },
      ],
    })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
  }

  async create(data) {
    const a = new AnnouncementModel(data);
    return a.save();
  }

  async update(id, data) {
    return AnnouncementModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return AnnouncementModel.findByIdAndDelete(id);
  }
}

module.exports = MongoAnnouncementRepository;
