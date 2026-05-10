/**
 * DOMAIN LAYER — Section Entity
 * Represents a class-section-subject assignment with a teacher.
 */
class Section {
  constructor({ id, classId, section, subject, teacherId, studentCount, createdAt }) {
    this.id           = id;
    this.classId      = classId;    // e.g. '6', '9', 'X', 'nursery'
    this.section      = section;    // e.g. 'A', 'B'
    this.subject      = subject;
    this.teacherId    = teacherId;
    this.studentCount = studentCount || 0;
    this.createdAt    = createdAt || new Date();
  }
}

module.exports = Section;
