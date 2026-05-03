/**
 * DOMAIN ENTITY: AttendanceRecord
 * Represents a single daily attendance entry for a student.
 * Encapsulates business rules around valid statuses.
 */
class AttendanceRecord {
  static VALID_STATUSES = ['Present', 'Absent', 'Late', 'Leave'];

  constructor({ id, studentId, date, status, note, createdAt }) {
    this.id        = id;
    this.studentId = studentId;
    this.date      = date instanceof Date ? date : new Date(date);
    this.status    = status;
    this.note      = note || null;
    this.createdAt = createdAt || new Date();
  }

  /** Returns true if this record has a valid status value */
  isValidStatus() {
    return AttendanceRecord.VALID_STATUSES.includes(this.status);
  }

  /** Returns the date formatted as YYYY-MM-DD */
  getFormattedDate() {
    return this.date.toISOString().split('T')[0];
  }

  /** Returns the full weekday name (e.g. "Monday") */
  getDayName() {
    return this.date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  /** Returns the month label used for grouping (e.g. "March 2026") */
  getMonthLabel() {
    return this.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

module.exports = AttendanceRecord;
