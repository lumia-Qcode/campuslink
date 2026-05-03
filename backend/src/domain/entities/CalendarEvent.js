/**
 * DOMAIN ENTITY: CalendarEvent
 * Represents a single academic calendar entry (exam, holiday, ceremony, etc.).
 * Pure business object — no framework or DB dependencies.
 */
class CalendarEvent {
  static VALID_TYPES = ['exam', 'holiday', 'event', 'meeting', 'activity', 'other'];

  constructor({ id, title, date, type, description, targetRoles, createdAt }) {
    this.id          = id;
    this.title       = title;
    this.date        = date instanceof Date ? date : new Date(date);
    this.type        = type || 'other';
    this.description = description || null;
    this.targetRoles = targetRoles || ['student', 'teacher', 'admin'];
    this.createdAt   = createdAt || new Date();
  }

  /** Returns date as ISO string YYYY-MM-DD */
  getFormattedDate() {
    return this.date.toISOString().split('T')[0];
  }

  /** Returns true if the event is in the future relative to the given reference date */
  isUpcoming(referenceDate = new Date()) {
    return this.date >= referenceDate;
  }

  /** Returns the month label used for grouping (e.g. "April 2026") */
  getMonthLabel() {
    return this.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

module.exports = CalendarEvent;
