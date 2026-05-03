/**
 * USE CASE: GetTeacherCalendar
 * Returns calendar events, with optional month/type filters.
 * Shares the same CalendarEvent collection as students.
 */
class GetTeacherCalendar {
  constructor(calendarRepository) {
    this.calendarRepo = calendarRepository;
  }

  /**
   * @param {string} [month] – e.g. "May 2026"
   * @param {string} [type]  – 'exam'|'holiday'|'event'|'meeting'|'activity'|'other'
   */
  async execute(month, type) {
    const VALID_TYPES = ['exam', 'holiday', 'event', 'meeting', 'activity', 'other'];
    const filter = {};

    if (month) filter.month = String(month).slice(0, 30);
    if (type && VALID_TYPES.includes(type)) filter.type = type;

    const events = await this.calendarRepo.findAll(filter);
    return events;
  }
}

module.exports = GetTeacherCalendar;
