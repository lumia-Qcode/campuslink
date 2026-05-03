/**
 * USE CASE: GetTeacherAnnouncements
 * Returns announcements visible to teachers, with optional tag filtering.
 */
class GetTeacherAnnouncements {
  constructor(announcementRepository) {
    this.announcementRepo = announcementRepository;
  }

  /**
   * @param {string} [tag] – optional tag filter: 'urgent'|'event'|'info'|'notice'
   */
  async execute(tag) {
    const VALID_TAGS = ['urgent', 'event', 'info', 'notice'];
    const filter = {};

    if (tag && VALID_TAGS.includes(tag)) {
      filter.tag = tag;
    }

    const announcements = await this.announcementRepo.findAll(filter);
    return announcements;
  }
}

module.exports = GetTeacherAnnouncements;
