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

  async getAnnouncementsForRole(role) {
    return this.announcementRepository.findByRole(role);
  }

  async createAnnouncement(data, adminUserId) {
    const { title, content, targetRoles, targetClasses, tag, pinned } = data;
    if (!title || !content) throw new Error('Title and content are required');

    return this.announcementRepository.create({
      title,
      content,
      postedBy:      adminUserId,
      targetRoles:   targetRoles   || ['student', 'teacher', 'admin'],
      targetClasses: targetClasses || [],
      tag:           tag           || 'info',
      pinned:        pinned        || false,
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
