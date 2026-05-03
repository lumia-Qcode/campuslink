/**
 * PORT: ICalendarRepository
 * Defines the contract the application layer uses to query calendar events.
 * Concrete adapters (Mongo, in-memory, etc.) implement this interface.
 */
class ICalendarRepository {
  /**
   * Return all CalendarEvent domain objects visible to the given role.
   * @param {string} role – 'student' | 'teacher' | 'admin'
   * @returns {Promise<CalendarEvent[]>}
   */
  async findByRole(role) { throw new Error('Not implemented'); }

  /**
   * Return events within an inclusive date range.
   * @param {string} role
   * @param {Date}   from
   * @param {Date}   to
   * @returns {Promise<CalendarEvent[]>}
   */
  async findByRoleAndDateRange(role, from, to) { throw new Error('Not implemented'); }

  /**
   * Return a single CalendarEvent by its ID.
   * @param {string} id
   * @returns {Promise<CalendarEvent|null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * Persist a new calendar event.
   * @param {object} data
   * @returns {Promise<CalendarEvent>}
   */
  async create(data) { throw new Error('Not implemented'); }
}

module.exports = ICalendarRepository;
