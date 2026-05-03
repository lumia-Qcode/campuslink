/**
 * USE CASE: GetTeacherDashboard
 * Aggregates the summary data shown on the teacher's home dashboard.
 */
class GetTeacherDashboard {
  constructor(teacherRepository, studentRepository, markRepository, announcementRepository) {
    this.teacherRepo      = teacherRepository;
    this.studentRepo      = studentRepository;
    this.markRepo         = markRepository;
    this.announcementRepo = announcementRepository;
  }

  async execute(userId) {
    // 1. Fetch teacher profile
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Count total students across all assigned classes
    let totalStudents = 0;
    for (const classLabel of teacher.classes) {
      const students = await this.studentRepo.findByClassLabel(classLabel);
      totalStudents += students.length;
    }

    // 3. Latest 3 announcements
    const announcements = await this.announcementRepo.findAll({ limit: 3 });

    return {
      teacher: {
        id:            teacher.id,
        name:          teacher.name,
        email:         teacher.email,
        teacherId:     teacher.teacherId,
        subjects:      teacher.subjects,
        classes:       teacher.classes,
        department:    teacher.department,
        qualification: teacher.qualification,
        joined:        teacher.joined,
      },
      stats: {
        totalClasses:  teacher.classes.length,
        totalSubjects: teacher.subjects.length,
        totalStudents,
      },
      recentAnnouncements: announcements,
    };
  }
}

module.exports = GetTeacherDashboard;
