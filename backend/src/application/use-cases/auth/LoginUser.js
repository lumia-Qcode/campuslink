const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * USE CASE: LoginUser
 * Validates credentials and issues a signed JWT.
 * On success also fetches the role-specific profile (student or teacher).
 */
class LoginUser {
  constructor(userRepository, studentRepository, teacherRepository) {
    this.userRepository    = userRepository;
    this.studentRepository = studentRepository;
    this.teacherRepository = teacherRepository;
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
    const storedHash = user.passwordHash || user.password || '';
    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 3. Build JWT payload with role
    const payload = {
      sub:   user.id,
      role:  user.role,
      name:  user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // 4. Fetch role-specific profile
    let studentProfile = null;
    let teacherProfile = null;

    if (user.role === 'student' && this.studentRepository) {
      studentProfile = await this.studentRepository.findByUserId(user.id);
    }

    if (user.role === 'teacher' && this.teacherRepository) {
      teacherProfile = await this.teacherRepository.findByUserId(user.id);
    }

    return {
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        ...(studentProfile && {
          studentId: studentProfile.studentId,
          class:     String(studentProfile.classLevel),
          section:   studentProfile.section,
          rollNo:    studentProfile.rollNo,
          session:   studentProfile.session,
        }),
        ...(teacherProfile && {
          teacherId:     teacherProfile.teacherId,
          subjects:      teacherProfile.subjects,
          classes:       teacherProfile.classes,
          department:    teacherProfile.department,
          qualification: teacherProfile.qualification,
        }),
      },
    };
  }
}

module.exports = LoginUser;