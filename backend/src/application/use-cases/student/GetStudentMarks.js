/**
 * USE CASE: GetStudentMarks
 * Returns all marks with computed grades, grouped by subject.
 */
class GetStudentMarks {
  constructor(studentRepository, markRepository) {
    this.studentRepository = studentRepository;
    this.markRepository = markRepository;
  }

  async execute(userId, { component } = {}) {
    // 1. Resolve student
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      const err = new Error('Student profile not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Fetch marks (optionally filter by component)
    let marks;
    if (component && component !== 'All') {
      marks = await this.markRepository.findByStudentIdAndComponent(student.id, component);
    } else {
      marks = await this.markRepository.findByStudentId(student.id);
    }

    // 3. Enrich with computed fields
    const enriched = marks.map(m => ({
      id: m.id,
      subject: m.subject,
      component: m.component,
      marks: m.marks,
      total: m.total,
      percentage: this._pct(m.marks, m.total),
      grade: this._grade(m.marks, m.total),
      examDate: m.examDate,
    }));

    // 4. Group by subject for summary cards
    const grouped = enriched.reduce((acc, m) => {
      if (!acc[m.subject]) acc[m.subject] = [];
      acc[m.subject].push(m);
      return acc;
    }, {});

    const subjectSummaries = Object.entries(grouped).map(([subject, entries]) => {
      const totalMarks = entries.reduce((s, e) => s + e.marks, 0);
      const totalMax   = entries.reduce((s, e) => s + e.total, 0);
      const pct = this._pct(totalMarks, totalMax);
      return { subject, totalMarks, totalMax, percentage: pct, grade: this._grade(totalMarks, totalMax), entries };
    });

    // 5. Overall average
    const overallPct = enriched.length
      ? Math.round(enriched.reduce((s, m) => s + m.percentage, 0) / enriched.length)
      : 0;

    return {
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: String(student.classLevel),
        section: student.section,
      },
      overallPercentage: overallPct,
      overallGrade: this._grade(overallPct, 100),
      marks: enriched,
      subjectSummaries,
    };
  }

  _pct(marks, total) {
    if (!total) return 0;
    return Math.round((marks / total) * 100);
  }

  _grade(marks, total) {
    const pct = typeof marks === 'number' && total ? (marks / total) * 100 : marks;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }
}

module.exports = GetStudentMarks;
