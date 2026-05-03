/**
 * PORT: ITimetableRepository
 * Defines the contract the application layer uses to query timetable entries.
 * Concrete adapters (Mongo, in-memory, etc.) implement this.
 */
class ITimetableRepository {
  /**
   * Return all TimetableEntry objects for a given class and section.
   * @param {number} classLevel
   * @param {string} section
   * @returns {Promise<TimetableEntry[]>}
   */
  async findByClassAndSection(classLevel, section) { throw new Error('Not implemented'); }

  /**
   * Return entries for a class/section filtered to a single day.
   * @param {number} classLevel
   * @param {string} section
   * @param {string} day  – e.g. 'Monday'
   * @returns {Promise<TimetableEntry[]>}
   */
  async findByClassSectionAndDay(classLevel, section, day) { throw new Error('Not implemented'); }

  /**
   * Persist a new timetable entry.
   * @param {object} data
   * @returns {Promise<TimetableEntry>}
   */
  async create(data) { throw new Error('Not implemented'); }

  /**
   * Update an existing entry.
   * @param {string} id
   * @param {object} data
   * @returns {Promise<TimetableEntry>}
   */
  async update(id, data) { throw new Error('Not implemented'); }

  /**
   * Delete a timetable entry.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = ITimetableRepository;
