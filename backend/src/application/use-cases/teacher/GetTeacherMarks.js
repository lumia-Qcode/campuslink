/**
 * USE CASE: GetTeacherMarks
 * Returns a class mark-sheet for a given subject + exam component.
 * Each row shows one student's mark (or null if not yet entered).
 */
class GetTeacherMarks {
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
   */
  async execute(userId, classLabel, subject, component) {
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
    if (!teacher.teachesSubject(subject)) {
      const err = new Error('You do not teach this subject');
      err.statusCode = 403;
      throw err;
    }

    // 2. Fetch students
    const students = await this.studentRepo.findByClassLabel(classLabel);
    const studentIds = students.map(s => s.id);

    // 3. Fetch existing marks
    const marks = await this.markRepo.findByStudentIdsSubjectAndComponent(
      studentIds, subject, component
    );
    const markMap = {};
    for (const m of marks) {
      markMap[m.studentId] = m;
    }

    // 4. Build mark-sheet rows
    const rows = students.map(s => {
      const m = markMap[s.id] || null;
      return {
        studentId:   s.id,
        studentCode: s.studentId,
        name:        s.name,
        rollNo:      s.rollNo,
        markId:      m ? m.id : null,
        marks:       m ? m.marks : null,
        total:       m ? m.total : 100,
        percentage:  m ? m.getPercentage() : null,
        grade:       m ? m.getGrade() : null,
        examDate:    m ? m.examDate : null,
      };
    });

    return { classLabel, subject, component, rows };
  }
}

module.exports = GetTeacherMarks;
