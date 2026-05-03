/**
 * USE CASE: GetStudentCalendar
 *
 * Fetches all calendar events visible to students, optionally filtered by a
 * month or type, and marks each event as upcoming or past relative to today.
 *
 * Dependencies are injected via the constructor (Hexagonal Architecture).
 */
class GetStudentCalendar {
  /**
   * @param {ICalendarRepository} calendarRepository
   */
  constructor(calendarRepository) {
    this.calendarRepository = calendarRepository;
  }

  /**
   * @param {object} filters
   * @param {string} [filters.month]  – e.g. "April 2026"; filters the returned list
   * @param {string} [filters.type]   – 'exam' | 'holiday' | 'event' | 'meeting' | 'activity' | 'other'
   * @returns {Promise<object>}
   */
  async execute(filters = {}) {
    // ── 1. Fetch all events visible to students ─────────────────────────────
    const allEvents = await this.calendarRepository.findByRole('student');

    // ── 2. Determine reference date ("today") ───────────────────────────────
    const now = new Date();
    // Normalise to midnight so whole-day comparisons are stable
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // ── 3. Apply optional filters ───────────────────────────────────────────
    const { month, type } = filters;
    let filtered = allEvents;

    if (month && month !== 'All') {
      filtered = filtered.filter(e => e.getMonthLabel() === month);
    }

    if (type && type !== 'All') {
      filtered = filtered.filter(e => e.type === type);
    }

    // ── 4. Extract distinct months for the month-filter dropdown ───────────
    const months = [...new Set(
      allEvents.map(e => e.getMonthLabel())
    )]; // already sorted by date ASC from the repository

    // ── 5. Count upcoming vs past (from full unfiltered set) ───────────────
    const upcomingCount = allEvents.filter(e => e.isUpcoming(today)).length;
    const pastCount     = allEvents.length - upcomingCount;

    // ── 6. Shape the response ──────────────────────────────────────────────
    return {
      totalEvents:    allEvents.length,
      upcomingCount,
      pastCount,
      months,
      events: filtered.map(e => ({
        id:          e.id,
        date:        e.getFormattedDate(),
        title:       e.title,
        type:        e.type,
        description: e.description,
        isUpcoming:  e.isUpcoming(today),
        monthLabel:  e.getMonthLabel(),
      })),
      totalFiltered: filtered.length,
    };
  }
}

module.exports = GetStudentCalendar;
