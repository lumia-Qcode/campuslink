/**
 * USE CASE: GetStudentActivities
 * Returns extra-curricular activities for the authenticated student.
 */
class GetStudentActivities {
  constructor(studentRepository, activityRepository) {
    this.studentRepository  = studentRepository;
    this.activityRepository = activityRepository;
  }

  /**
   * @param {string} userId – JWT sub (User ObjectId)
   */
  async execute(userId) {
    // 1. Resolve student profile
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Fetch activities
    const activities = await this.activityRepository.findByStudentId(student.id);

    return {
      student: {
        id:        student.id,
        name:      student.name,
        studentId: student.studentId,
      },
      total:      activities.length,
      activities,
    };
  }
}

module.exports = GetStudentActivities;
