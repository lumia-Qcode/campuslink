/**
 * USE CASE: SaveTeacherMarks
 * Bulk-upserts marks for a class / subject / component.
 * Security: verifies teacher is assigned to both class and subject.
 */
class SaveTeacherMarks {
  constructor(teacherRepository, studentRepository, markRepository) {
    this.teacherRepo = teacherRepository;
    this.studentRepo = studentRepository;
    this.markRepo    = markRepository;
  }

  /**
   * @param {string} userId      – authenticated teacher's User ObjectId
   * @param {string} classLabel  – e.g. "10-A"
   * @param {string} subject     – e.g. "Mathematics"
   * @param {string} component   – e.g. "MidTerm - I"
   * @param {Array}  entries     – [{ studentId, marks, total, examDate? }]
   */
  async execute(userId, classLabel, subject, component, entries) {
    // 1. Verify teacher + class + subject
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
    if (!teacher.teachesSubject(subject)) {
      const err = new Error('You do not teach this subject');
      err.statusCode = 403;
      throw err;
    }

    const VALID_COMPONENTS = ['MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'];
    if (!VALID_COMPONENTS.includes(component)) {
      const err = new Error('Invalid exam component');
      err.statusCode = 400;
      throw err;
    }

    // 2. Fetch valid student ids for this class
    const students = await this.studentRepo.findByClassLabel(classLabel);
    const validIds = new Set(students.map(s => s.id));

    const saved  = [];
    const errors = [];

    for (const entry of entries) {
      const { studentId, marks, total, examDate } = entry;

      if (!validIds.has(String(studentId))) {
        errors.push({ studentId, reason: 'Student not in this class' });
        continue;
      }

      const parsedMarks = Number(marks);
      const parsedTotal = Number(total) || 100;

      if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > parsedTotal) {
        errors.push({ studentId, reason: 'marks must be 0 ≤ marks ≤ total' });
        continue;
      }

      const rec = await this.markRepo.upsertMark(
        studentId,
        subject,
        component,
        parsedMarks,
        parsedTotal,
        examDate || null
      );
      saved.push(rec);
    }

    return { saved: saved.length, errors };
  }
}

module.exports = SaveTeacherMarks;
