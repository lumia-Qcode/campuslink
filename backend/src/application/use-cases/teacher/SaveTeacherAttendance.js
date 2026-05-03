/**
 * USE CASE: SaveTeacherAttendance
 * Bulk-upserts attendance records for a class on a given date.
 *
 * Receives an array of { studentId, status, note } entries and upserts each.
 * Security: verifies teacher is assigned to the class before writing.
 */
class SaveTeacherAttendance {
  constructor(teacherRepository, studentRepository, attendanceRepository) {
    this.teacherRepo    = teacherRepository;
    this.studentRepo    = studentRepository;
    this.attendanceRepo = attendanceRepository;
  }

  /**
   * @param {string} userId      – authenticated teacher's User ObjectId
   * @param {string} classLabel  – e.g. "10-A"
   * @param {string} dateStr     – YYYY-MM-DD
   * @param {Array}  records     – [{ studentId, status, note? }]
   */
  async execute(userId, classLabel, dateStr, records) {
    // 1. Verify teacher
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }
    if (!teacher.teachesClass(classLabel)) {
      const err = new Error('You are not assigned to this class');
      err.statusCode = 403;
      throw err;
    }

    // 2. Fetch valid student ids for that class (security: prevents writing
    //    attendance for students not in this class)
    const students = await this.studentRepo.findByClassLabel(classLabel);
    const validIds = new Set(students.map(s => s.id));

    const date = new Date(dateStr);
    const saved = [];
    const errors = [];

    // 3. Upsert each record
    for (const row of records) {
      const { studentId, status, note } = row;

      if (!validIds.has(String(studentId))) {
        errors.push({ studentId, reason: 'Student not in this class' });
        continue;
      }

      const VALID_STATUSES = ['Present', 'Absent', 'Late', 'Leave'];
      if (!VALID_STATUSES.includes(status)) {
        errors.push({ studentId, reason: `Invalid status: ${status}` });
        continue;
      }

      const rec = await this.attendanceRepo.upsertForStudent(
        studentId,
        date,
        status,
        note || null
      );
      saved.push(rec);
    }

    return { saved: saved.length, errors };
  }
}

module.exports = SaveTeacherAttendance;
