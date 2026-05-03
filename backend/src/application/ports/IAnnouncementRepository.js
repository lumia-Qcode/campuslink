/**
 * PORT: IAnnouncementRepository
 *
 * Defines the contract the application layer uses to query and persist
 * announcements. Concrete adapters (MongoAnnouncementRepository, etc.)
 * implement this interface.
 *
 * Following Hexagonal Architecture, the application core depends ONLY
 * on this interface — never on Mongoose or any external framework.
 */

class IAnnouncementRepository {
  /**
   * Returns the most recent `limit` announcements (all roles).
   * @param {number} limit
   * @returns {Promise<Announcement[]>}
   */
  async findRecent(limit) {
    throw new Error('IAnnouncementRepository.findRecent() must be implemented');
  }

  /**
   * Returns all announcements, optionally filtered by tag.
   * @param {{ tag?: string }} filters
   * @returns {Promise<Announcement[]>}
   */
  async findAll(filters) {
    throw new Error('IAnnouncementRepository.findAll() must be implemented');
  }

  /**
   * Returns all announcements visible to a given role.
   * @param {string} role  – 'student' | 'teacher' | 'admin'
   * @param {{ tag?: string }} [filters]
   * @returns {Promise<Announcement[]>}
   */
  async findByRole(role, filters) {
    throw new Error('IAnnouncementRepository.findByRole() must be implemented');
  }

  /**
   * Persists a new announcement and returns the domain object.
   * @param {{ title: string, description: string, tag: string, targetRoles: string[], createdBy?: string }} data
   * @returns {Promise<Announcement>}
   */
  async create(data) {
    throw new Error('IAnnouncementRepository.create() must be implemented');
  }

  /**
   * Deletes an announcement by its ID.
   * @param {string} id
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async deleteById(id) {
    throw new Error('IAnnouncementRepository.deleteById() must be implemented');
  }
}

module.exports = IAnnouncementRepository;
