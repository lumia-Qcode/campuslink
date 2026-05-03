/**
 * DOMAIN ENTITY: Student
 * Encapsulates student-specific business rules.
 */
class Student {
  constructor({ id, userId, name, email, studentId, classLevel, section, rollNo, session, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.studentId = studentId;
    this.classLevel = classLevel;
    this.section = section;
    this.rollNo = rollNo;
    this.session = session || '2025-2026';
    this.createdAt = createdAt || new Date();
  }

  getClassLabel() {
    return `${this.classLevel}-${this.section}`;
  }

  isValidClass() {
    return this.classLevel >= 1 && this.classLevel <= 12;
  }
}

module.exports = Student;
