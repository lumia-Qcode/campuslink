/**
 * USE CASE: GetStudentTimetable
 *
 * Resolves the authenticated student, fetches the timetable for their
 * class and section, and returns a structured payload suitable for both
 * the "Week" grid and the "Day" list views in the frontend.
 *
 * Dependencies are injected via the constructor (Hexagonal Architecture).
 */
class GetStudentTimetable {
  static DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * @param {IStudentRepository}    studentRepository
   * @param {ITimetableRepository}  timetableRepository
   */
  constructor(studentRepository, timetableRepository) {
    this.studentRepository   = studentRepository;
    this.timetableRepository = timetableRepository;
  }

  /**
   * @param {string} userId  – JWT sub (User._id)
   * @param {object} options
   * @param {string} [options.day]  – Optional filter: 'Monday' … 'Saturday'
   * @returns {Promise<object>}
   */
  async execute(userId, options = {}) {
    // ── 1. Resolve student ─────────────────────────────────────────────────
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // ── 2. Fetch all timetable entries for this class/section ──────────────
    const entries = await this.timetableRepository.findByClassAndSection(
      student.classLevel,
      student.section,
    );

    // ── 3. Group entries by day, sorted by period ─────────────────────────
    const byDay = GetStudentTimetable.DAYS.reduce((acc, day) => {
      acc[day] = entries
        .filter(e => e.day === day)
        .sort((a, b) => this._periodOrder(a.period) - this._periodOrder(b.period));
      return acc;
    }, {});

    // ── 4. Apply optional day filter ───────────────────────────────────────
    const { day } = options;
    const daySchedule = day && GetStudentTimetable.DAYS.includes(day)
      ? byDay[day]
      : null;

    // ── 5. Collect unique subjects (for legend) ────────────────────────────
    const subjects = [...new Set(entries.map(e => e.subject))];

    // ── 6. Shape serialised entries ────────────────────────────────────────
    const serialise = (entry) => ({
      id:      entry.id,
      day:     entry.day,
      period:  entry.period,
      time:    entry.time,
      subject: entry.subject,
      teacher: entry.teacher,
      room:    entry.room,
    });

    return {
      student: {
        id:         student.id,
        name:       student.name,
        studentId:  student.studentId,
        class:      String(student.classLevel),
        section:    student.section,
        classLabel: `Class ${student.classLevel}-${student.section}`,
        session:    student.session,
      },
      days:    GetStudentTimetable.DAYS,
      byDay:   Object.fromEntries(
        Object.entries(byDay).map(([d, arr]) => [d, arr.map(serialise)])
      ),
      // Convenience flat list (optionally filtered to one day)
      schedule: daySchedule
        ? daySchedule.map(serialise)
        : entries.map(serialise),
      subjects,
      totalPeriods: entries.length,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Extracts numeric value from period strings like "P1", "1", "8:00 - 8:45" */
  _periodOrder(period) {
    if (!period) return 999;
    const match = String(period).match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  }
}

module.exports = GetStudentTimetable;
