/**
 * DOMAIN ENTITY: User
 * Pure business logic — no framework dependencies.
 */
class User {
  constructor({ id, name, email, passwordHash, role, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role; // 'student' | 'teacher' | 'admin'
    this.createdAt = createdAt || new Date();
  }

  static ROLES = Object.freeze({ STUDENT: 'student', TEACHER: 'teacher', ADMIN: 'admin' });

  isStudent() { return this.role === User.ROLES.STUDENT; }
  isTeacher() { return this.role === User.ROLES.TEACHER; }
  isAdmin()   { return this.role === User.ROLES.ADMIN;   }

  hasValidRole() {
    return Object.values(User.ROLES).includes(this.role);
  }
}

module.exports = User;
