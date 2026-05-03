/**
 * USE CASE: GetStudentDashboard
 * Aggregates all data needed for the student dashboard screen.
 */
class GetStudentDashboard {
  constructor(studentRepository, markRepository, announcementRepository) {
    this.studentRepository = studentRepository;
    this.markRepository = markRepository;
    this.announcementRepository = announcementRepository;
  }

  async execute(userId) {
    // 1. Fetch student profile
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Fetch recent marks (latest component only for summary)
    const allMarks = await this.markRepository.findByStudentId(student.id);

    // 3. Compute average marks percentage
    const avgMarks = allMarks.length
      ? Math.round(
          allMarks.reduce((sum, m) => sum + (m.marks / m.total) * 100, 0) / allMarks.length
        )
      : null;

    // 4. Fetch recent announcements
    const announcements = await this.announcementRepository.findRecent(5);

    // 5. Build attendance summary (placeholder — attendance module is separate)
    const attendanceSummary = {
      overall: student.attendanceOverall || null,
      subjects: student.attendanceBySubject || [],
    };

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        class: String(student.classLevel),
        section: student.section,
        rollNo: student.rollNo,
        session: student.session,
      },
      stats: {
        avgMarks,
        feeStatus: student.feeStatus || 'Paid',
        class: `${student.classLevel}${student.section}`,
      },
      recentMarks: allMarks.slice(0, 4).map(m => ({
        subject: m.subject,
        component: m.component,
        marks: m.marks,
        total: m.total,
        percentage: m.marks && m.total ? Math.round((m.marks / m.total) * 100) : 0,
        grade: this._grade(m.marks, m.total),
      })),
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        tag: a.tag,
        date: a.createdAt,
      })),
      attendance: attendanceSummary,
      progress: student.progress || [],
    };
  }

  _grade(marks, total) {
    if (!total) return 'N/A';
    const pct = (marks / total) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }
}

module.exports = GetStudentDashboard;
