/**
 * DOMAIN ENTITY: Mark
 * Business rules for academic marks/grades.
 */
class Mark {
  constructor({ id, studentId, subject, component, marks, total, examDate, createdAt }) {
    this.id = id;
    this.studentId = studentId;
    this.subject = subject;
    this.component = component; // 'MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'
    this.marks = marks;
    this.total = total || 100;
    this.examDate = examDate;
    this.createdAt = createdAt || new Date();
  }

  getPercentage() {
    if (this.total === 0) return 0;
    return Math.round((this.marks / this.total) * 100);
  }

  getGrade() {
    const pct = this.getPercentage();
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }

  isPassing() {
    return this.getPercentage() >= 50;
  }

  static COMPONENTS = Object.freeze([
    'MidTerm - I', 'MidTerm - II', 'Final', 'Quiz', 'Assignment'
  ]);
}

module.exports = Mark;
