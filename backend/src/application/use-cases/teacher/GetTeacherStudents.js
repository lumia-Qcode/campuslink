/**
 * USE CASE: GetTeacherStudents
 * Returns the list of students for a class that the teacher is assigned to.
 * Security: verifies the teacher is actually assigned to the requested class.
 */
class GetTeacherStudents {
  constructor(teacherRepository, studentRepository) {
    this.teacherRepo = teacherRepository;
    this.studentRepo = studentRepository;
  }

  /**
   * @param {string} userId      – authenticated teacher's User ObjectId
   * @param {string} classLabel  – e.g. "10-A" (validated by middleware before reaching here)
   */
  async execute(userId, classLabel) {
    // 1. Load teacher profile
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Business rule: teacher must be assigned to that class
    if (!teacher.teachesClass(classLabel)) {
      const err = new Error('You are not assigned to this class');
      err.statusCode = 403;
      throw err;
    }

    // 3. Fetch students
    const students = await this.studentRepo.findByClassLabel(classLabel);

    return students.map(s => ({
      id:        s.id,
      studentId: s.studentId,
      name:      s.name,
      email:     s.email,
      rollNo:    s.rollNo,
      section:   s.section,
      classLevel: s.classLevel,
    }));
  }
}

module.exports = GetTeacherStudents;
