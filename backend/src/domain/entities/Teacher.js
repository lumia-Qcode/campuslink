/**
 * DOMAIN ENTITY: Teacher
 * Pure business logic — no framework or DB dependencies.
 */
class Teacher {
  constructor({ id, userId, name, email, teacherId, subjects, classes, department, qualification, joined, createdAt }) {
    this.id            = id;
    this.userId        = userId;
    this.name          = name;
    this.email         = email;
    this.teacherId     = teacherId;
    this.subjects      = subjects  || [];   // e.g. ['Mathematics', 'Computer Science']
    this.classes       = classes   || [];   // e.g. ['10-A', '10-B', '9-A']
    this.department    = department || null;
    this.qualification = qualification || null;
    this.joined        = joined    || null;
    this.createdAt     = createdAt || new Date();
  }

  /** Returns true if the teacher teaches the given class label (e.g. "10-A") */
  teachesClass(classLabel) {
    return this.classes.includes(classLabel);
  }

  /** Returns true if the teacher teaches the given subject */
  teachesSubject(subject) {
    return this.subjects.includes(subject);
  }
}

module.exports = Teacher;
