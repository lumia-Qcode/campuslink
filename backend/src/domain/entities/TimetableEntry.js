/**
 * DOMAIN LAYER — Timetable Entry Entity
 */
class TimetableEntry {
  constructor({ id, classId, section, day, period, subject, teacherId, startTime, endTime, createdAt }) {
    this.id        = id;
    this.classId   = classId;
    this.section   = section;
    this.day       = day;       // 'Monday' .. 'Friday'
    this.period    = period;    // 1-8
    this.subject   = subject;
    this.teacherId = teacherId;
    this.startTime = startTime; // e.g. '08:00'
    this.endTime   = endTime;   // e.g. '08:45'
    this.createdAt = createdAt || new Date();
  }
}

module.exports = TimetableEntry;
