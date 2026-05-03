/**
 * USE CASE: GetTeacherAttendance
 * Returns attendance records for a class on a specific date.
 * If no date is given, defaults to today.
 */
class GetTeacherAttendance {
  constructor(teacherRepository, studentRepository, attendanceRepository) {
    this.teacherRepo    = teacherRepository;
    this.studentRepo    = studentRepository;
    this.attendanceRepo = attendanceRepository;
  }

  /**
   * @param {string} userId      – authenticated teacher's User ObjectId
   * @param {string} classLabel  – e.g. "10-A"
   * @param {string} [dateStr]   – YYYY-MM-DD (defaults to today)
   */
  async execute(userId, classLabel, dateStr) {
    // 1. Load teacher and verify class assignment
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

    // 2. Resolve date — default to today
    const date = dateStr ? new Date(dateStr) : new Date();

    // 3. Fetch students for the class
    const students = await this.studentRepo.findByClassLabel(classLabel);
    const studentIds = students.map(s => s.id);

    // 4. Fetch attendance records for that date
    const records = await this.attendanceRepo.findByStudentIdsAndDate(studentIds, date);

    // 5. Build a lookup map: studentId → record
    const recordMap = {};
    for (const rec of records) {
      recordMap[rec.studentId] = rec;
    }

    // 6. Merge — one row per student even if no record yet
    const rows = students.map(s => {
      const rec = recordMap[s.id] || null;
      return {
        studentId:  s.id,
        studentCode: s.studentId,
        name:       s.name,
        rollNo:     s.rollNo,
        recordId:   rec ? rec.id : null,
        status:     rec ? rec.status : null,
        note:       rec ? rec.note  : null,
      };
    });

    return {
      classLabel,
      date: date.toISOString().split('T')[0],
      rows,
    };
  }
}

module.exports = GetTeacherAttendance;
