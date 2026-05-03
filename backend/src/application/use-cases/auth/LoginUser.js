const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * USE CASE: LoginUser
 * Validates credentials and issues a signed JWT.
 */
class LoginUser {
  constructor(userRepository, studentRepository) {
    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
  }

  async execute({ email, password }) {
    // 1. Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 3. Build JWT payload with role
    const payload = {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // 4. If student, fetch profile
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await this.studentRepository.findByUserId(user.id);
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(studentProfile && {
          studentId: studentProfile.studentId,
          class: String(studentProfile.classLevel),
          section: studentProfile.section,
          rollNo: studentProfile.rollNo,
          session: studentProfile.session,
        }),
      },
    };
  }
}

module.exports = LoginUser;
