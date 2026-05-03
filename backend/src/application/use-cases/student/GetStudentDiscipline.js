/**
 * USE CASE: GetStudentDiscipline
 *
 * Resolves the authenticated student, fetches their discipline records,
 * derives an overall conduct status, and returns a complete payload
 * ready for the Discipline page.
 *
 * Dependencies are injected via the constructor (Hexagonal Architecture).
 */
class GetStudentDiscipline {
  /**
   * @param {IStudentRepository}    studentRepository
   * @param {IDisciplineRepository} disciplineRepository
   */
  constructor(studentRepository, disciplineRepository) {
    this.studentRepository    = studentRepository;
    this.disciplineRepository = disciplineRepository;
  }

  /**
   * @param {string} userId – JWT sub (User._id)
   * @returns {Promise<object>}
   */
  async execute(userId) {
    // ── 1. Resolve student ──────────────────────────────────────────────────
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // ── 2. Fetch all discipline records for this student ────────────────────
    const records = await this.disciplineRepository.findByStudentId(student.id);

    // ── 3. Derive overall conduct status ────────────────────────────────────
    //
    // Rule: the most severe active record determines the overall status.
    // Priority: serious > warning > good
    // If no records exist the student has a clean record.
    const overallSeverity = this._deriveOverallSeverity(records);

    // ── 4. Get status metadata for UI rendering ─────────────────────────────
    // We borrow DisciplineRecord.getStatusMeta() through a temp object.
    const DisciplineRecord = require('../../../domain/entities/DisciplineRecord');
    const tempRecord = new DisciplineRecord({
      id: null, studentId: student.id, date: new Date(),
      remarks: '', severity: overallSeverity,
    });
    const statusMeta = tempRecord.getStatusMeta();

    // ── 5. Shape the response ──────────────────────────────────────────────
    return {
      student: {
        id:        student.id,
        name:      student.name,
        studentId: student.studentId,
        class:     String(student.classLevel),
        section:   student.section,
      },
      hasRecords:      records.length > 0,
      overallSeverity,
      statusMeta,
      // Most recent record (the one shown prominently on the page)
      latestRecord: records.length > 0 ? {
        id:        records[0].id,
        date:      records[0].getFormattedDate(),
        remarks:   records[0].remarks,
        severity:  records[0].severity,
        issuedBy:  records[0].issuedBy,
        statusMeta: records[0].getStatusMeta(),
      } : null,
      // Full history list
      records: records.map(r => ({
        id:        r.id,
        date:      r.getFormattedDate(),
        remarks:   r.remarks,
        severity:  r.severity,
        issuedBy:  r.issuedBy,
        statusMeta: r.getStatusMeta(),
      })),
      totalRecords: records.length,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Returns the highest severity across all records.
   * @param {DisciplineRecord[]} records
   * @returns {'good'|'warning'|'serious'}
   */
  _deriveOverallSeverity(records) {
    if (records.some(r => r.severity === 'serious'))  return 'serious';
    if (records.some(r => r.severity === 'warning'))  return 'warning';
    return 'good';
  }
}

module.exports = GetStudentDiscipline;
