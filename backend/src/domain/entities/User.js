/**
 * DOMAIN LAYER — User Entity
 * Pure business object. No framework dependencies.
 */
class User {
  constructor({ id, username, password, role, name, createdAt }) {
    this.id = id;
    this.username = username;
    this.password = password; // hashed
    this.role = role;         // 'admin' | 'teacher' | 'student'
    this.name = name;
    this.createdAt = createdAt || new Date();
  }

  isAdmin()   { return this.role === 'admin'; }
  isTeacher() { return this.role === 'teacher'; }
  isStudent() { return this.role === 'student'; }
}

module.exports = User;
