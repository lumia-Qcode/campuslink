/**
 * APPLICATION LAYER — Announcement Use Cases
 * Admin creates announcements; all roles (student/teacher) can read them.
 * This is the shared logic that student/teacher portals hook into later.
 */
class AnnouncementUseCases {
  constructor(announcementRepository) {
    this.announcementRepository = announcementRepository;
  }

  async getAllAnnouncements(filters = {}) {
    return this.announcementRepository.findAll(filters);
  }

  async getAnnouncementById(id) {
    const ann = await this.announcementRepository.findById(id);
    if (!ann) throw new Error('Announcement not found');
    return ann;
  }

  /**
   * Used by student/teacher portals to fetch their announcements.
   * role: 'student' | 'teacher' | 'admin'
   */
  async getAnnouncementsForRole(role) {
    return this.announcementRepository.findByRole(role);
  }

  async createAnnouncement(data, adminUserId) {
    const { title, content, targetRoles } = data;
    if (!title || !content) throw new Error('Title and content are required');

    return this.announcementRepository.create({
      title,
      content,
      postedBy:    adminUserId,
      targetRoles: targetRoles || ['student', 'teacher', 'admin'],
    });
  }

  async updateAnnouncement(id, data) {
    const ann = await this.announcementRepository.findById(id);
    if (!ann) throw new Error('Announcement not found');
    return this.announcementRepository.update(id, data);
  }

  async deleteAnnouncement(id) {
    const ann = await this.announcementRepository.findById(id);
    if (!ann) throw new Error('Announcement not found');
    return this.announcementRepository.delete(id);
  }
}

module.exports = AnnouncementUseCases;
