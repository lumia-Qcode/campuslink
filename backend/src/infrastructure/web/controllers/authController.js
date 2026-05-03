const RegisterUser = require('../../../application/use-cases/auth/RegisterUser');
const LoginUser = require('../../../application/use-cases/auth/LoginUser');
const MongoUserRepository = require('../../database/repositories/MongoUserRepository');
const MongoStudentRepository = require('../../database/repositories/MongoStudentRepository');

// Dependency injection — compose at controller boundary
const userRepo    = new MongoUserRepository();
const studentRepo = new MongoStudentRepository();

const registerUseCase = new RegisterUser(userRepo, studentRepo);
const loginUseCase    = new LoginUser(userRepo, studentRepo);

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, classLevel, section } = req.body;
    const result = await registerUseCase.execute({ name, email, password, role, classLevel, section });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUseCase.execute({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.sub);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = { id: user.id, name: user.name, email: user.email, role: user.role };

    if (user.role === 'student') {
      const student = await studentRepo.findByUserId(user.id);
      if (student) {
        profile = {
          ...profile,
          studentId: student.studentId,
          class: String(student.classLevel),
          section: student.section,
          rollNo: student.rollNo,
          session: student.session,
        };
      }
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
