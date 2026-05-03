const bcrypt = require('bcryptjs');
const User = require('../../../domain/entities/User');

/**
 * USE CASE: RegisterUser
 * Application-layer orchestration for user registration.
 */
class RegisterUser {
  constructor(userRepository, studentRepository) {
    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
  }

  async execute({ name, email, password, role, classLevel, section }) {
    // 1. Business rule: email uniqueness
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }

    // 2. Business rule: valid role
    const domainUser = new User({ name, email, passwordHash: '', role });
    if (!domainUser.hasValidRole()) {
      const err = new Error('Invalid role. Must be student, teacher, or admin');
      err.statusCode = 400;
      throw err;
    }

    // 3. Hash password (infrastructure concern delegated here for simplicity)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Persist user
    const createdUser = await this.userRepository.create({
      name,
      email,
      passwordHash,
      role,
    });

    // 5. If student, auto-create student profile
    if (role === User.ROLES.STUDENT) {
      const studentIdStr = `S-${Date.now()}`;
      await this.studentRepository.create({
        userId: createdUser.id,
        name,
        email,
        studentId: studentIdStr,
        classLevel: classLevel || 1,
        section: section || 'A',
        rollNo: null,
        session: '2025-2026',
      });
    }

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };
  }
}

module.exports = RegisterUser;
