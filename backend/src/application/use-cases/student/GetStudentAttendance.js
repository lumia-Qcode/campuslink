/**
 * USE CASE: GetStudentAttendance
 *
 * Resolves the authenticated student, fetches their attendance records
 * (with optional status / month filters), computes summary statistics,
 * and returns a complete payload ready for the Attendance page.
 *
 * Dependencies are injected via the constructor (Hexagonal Architecture).
 */
class GetStudentAttendance {
  /**
   * @param {IStudentRepository}    studentRepository
   * @param {IAttendanceRepository} attendanceRepository
   */
  constructor(studentRepository, attendanceRepository) {
    this.studentRepository    = studentRepository;
    this.attendanceRepository = attendanceRepository;
  }

  /**
   * @param {string} userId   – JWT sub (User._id)
   * @param {object} filters
   * @param {string} [filters.status]  – 'Present' | 'Absent' | 'Late' | 'Leave'
   * @param {string} [filters.month]   – e.g. "March 2026"
   * @returns {Promise<object>}
   */
  async execute(userId, filters = {}) {
    // ── 1. Resolve student ──────────────────────────────────────────────────
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // ── 2. Fetch all records for this student ───────────────────────────────
    const allRecords = await this.attendanceRepository.findByStudentId(student.id);

    // ── 3. Compute overall statistics (always from the full set) ───────────
    const stats = this._computeStats(allRecords);

    // ── 4. Apply optional filters to the records list ──────────────────────
    const { status, month } = filters;
    let filteredRecords = allRecords;

    if (status && status !== 'All') {
      filteredRecords = filteredRecords.filter(r => r.status === status);
    }

    if (month && month !== 'All') {
      filteredRecords = filteredRecords.filter(r => r.getMonthLabel() === month);
    }

    // ── 5. Extract distinct months for filter dropdown ─────────────────────
    const months = [...new Set(
      allRecords.map(r => r.getMonthLabel())
    )].sort((a, b) => new Date(a) - new Date(b));

    // ── 6. Subject-wise attendance comes from student profile ──────────────
    const subjectAttendance = (student.attendanceBySubject || []).map((s, i) => ({
      name:       s.name,
      percentage: s.percentage,
      color:      s.color || this._subjectColor(i),
    }));

    // ── 7. Shape the response ──────────────────────────────────────────────
    return {
      student: {
        id:        student.id,
        name:      student.name,
        studentId: student.studentId,
        class:     String(student.classLevel),
        section:   student.section,
      },
      overall:    stats.overall,
      stats: {
        total:   stats.total,
        present: stats.present,
        absent:  stats.absent,
        late:    stats.late,
        leave:   stats.leave,
      },
      subjects: subjectAttendance,
      months,
      records: filteredRecords.map(r => ({
        id:      r.id,
        date:    r.getFormattedDate(),
        day:     r.getDayName(),
        status:  r.status,
        note:    r.note,
      })),
      totalFiltered: filteredRecords.length,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  _computeStats(records) {
    const total   = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent  = records.filter(r => r.status === 'Absent').length;
    const late    = records.filter(r => r.status === 'Late').length;
    const leave   = records.filter(r => r.status === 'Leave').length;

    // Overall = present-days / school-days (Late counts as partial present)
    const overall = total > 0
      ? Math.round(((present + late * 0.5) / total) * 100)
      : 0;

    return { total, present, absent, late, leave, overall };
  }

  _subjectColor(index) {
    const COLORS = ['#4f8ef7', '#9b6dff', '#2db87b', '#f5c842', '#ff6b6b', '#0ea5e9'];
    return COLORS[index % COLORS.length];
  }
}

module.exports = GetStudentAttendance;
