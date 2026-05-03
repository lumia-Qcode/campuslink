/**
 * USE CASE: GetStudentAnnouncements
 *
 * Returns announcements that target the 'student' role,
 * with optional tag filtering.
 *
 * Follows Hexagonal Architecture — depends only on the IAnnouncementRepository
 * port interface, never on Mongoose or Express directly.
 */
class GetStudentAnnouncements {
  /**
   * @param {import('../../ports/IAnnouncementRepository')} announcementRepository
   */
  constructor(announcementRepository) {
    this.announcementRepository = announcementRepository;
  }

  /**
   * @param {{ tag?: string }} [filters]
   * @returns {Promise<{
   *   total:         number,
   *   announcements: Array<{
   *     id:          string,
   *     title:       string,
   *     description: string,
   *     tag:         string,
   *     date:        string,
   *     createdAt:   Date,
   *   }>,
   *   tagCounts: Record<string, number>,
   * }>}
   */
  async execute(filters = {}) {
    // Fetch only announcements visible to students
    const all = await this.announcementRepository.findByRole('student');

    // Apply optional tag filter (case-insensitive)
    const { tag } = filters;
    const filtered = tag && tag !== 'all' && tag !== 'All'
      ? all.filter(a => a.tag === String(tag).toLowerCase())
      : all;

    // Pre-compute tag counts so the frontend doesn't have to
    const tagCounts = filtered.reduce((acc, a) => {
      acc[a.tag] = (acc[a.tag] || 0) + 1;
      return acc;
    }, {});

    return {
      total:         filtered.length,
      announcements: filtered.map(a => a.toJSON()),
      tagCounts,
    };
  }
}

module.exports = GetStudentAnnouncements;
