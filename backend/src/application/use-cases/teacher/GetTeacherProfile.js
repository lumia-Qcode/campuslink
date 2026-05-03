/**
 * USE CASE: GetTeacherProfile
 * Returns the full teacher profile for the authenticated teacher.
 */
class GetTeacherProfile {
  constructor(teacherRepository) {
    this.teacherRepo = teacherRepository;
  }

  async execute(userId) {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }
    return teacher;
  }
}

module.exports = GetTeacherProfile;
