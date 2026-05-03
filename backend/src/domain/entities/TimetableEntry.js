/**
 * DOMAIN ENTITY: TimetableEntry
 * Represents one period slot in a class timetable.
 * Encapsulates business rules for valid days and period ordering.
 */
class TimetableEntry {
  static VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor({ id, classLevel, section, day, period, time, subject, teacher, room, session, createdAt }) {
    this.id         = id;
    this.classLevel = classLevel;
    this.section    = section;
    this.day        = day;
    this.period     = period;   // e.g. "P1" or "1"
    this.time       = time;     // e.g. "8:00 - 8:45"
    this.subject    = subject;
    this.teacher    = teacher || null;
    this.room       = room || null;
    this.session    = session || '2025-2026';
    this.createdAt  = createdAt || new Date();
  }

  /** Returns true when day is a valid school day */
  isValidDay() {
    return TimetableEntry.VALID_DAYS.includes(this.day);
  }

  /** Convenience label combining class and section */
  getClassLabel() {
    return `${this.classLevel}-${this.section}`;
  }
}

module.exports = TimetableEntry;
