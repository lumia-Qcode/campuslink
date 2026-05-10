/**
 * INFRASTRUCTURE — Dependency Injection Container
 *
 * This is the composition root. It wires:
 *   MongoDB Repositories (adapters/out)
 *     → Use Cases (application)
 *       → Controllers (adapters/in)
 *         → Routes
 *
 * Nothing in the layers above knows about this file.
 */

// ── Repositories (adapters/out) ──
const MongoUserRepository         = require('../adapters/out/mongodb/repositories/MongoUserRepository');
const MongoStudentRepository      = require('../adapters/out/mongodb/repositories/MongoStudentRepository');
const MongoTeacherRepository      = require('../adapters/out/mongodb/repositories/MongoTeacherRepository');
const MongoSectionRepository      = require('../adapters/out/mongodb/repositories/MongoSectionRepository');
const MongoFeeRepository          = require('../adapters/out/mongodb/repositories/MongoFeeRepository');
const MongoAnnouncementRepository = require('../adapters/out/mongodb/repositories/MongoAnnouncementRepository');
const MongoTimetableRepository    = require('../adapters/out/mongodb/repositories/MongoTimetableRepository');

// ── Use Cases (application) ──
const AuthUseCases         = require('../application/use-cases/auth/AuthUseCases');
const StudentUseCases      = require('../application/use-cases/students/StudentUseCases');
const TeacherUseCases      = require('../application/use-cases/teachers/TeacherUseCases');
const SectionUseCases      = require('../application/use-cases/sections/SectionUseCases');
const FeeUseCases          = require('../application/use-cases/fees/FeeUseCases');
const AnnouncementUseCases = require('../application/use-cases/announcements/AnnouncementUseCases');
const TimetableUseCases    = require('../application/use-cases/timetable/TimetableUseCases');

// ── Controllers (adapters/in) ──
const AuthController         = require('../adapters/in/http/controllers/AuthController');
const StudentController      = require('../adapters/in/http/controllers/StudentController');
const TeacherController      = require('../adapters/in/http/controllers/TeacherController');
const SectionController      = require('../adapters/in/http/controllers/SectionController');
const FeeController          = require('../adapters/in/http/controllers/FeeController');
const AnnouncementController = require('../adapters/in/http/controllers/AnnouncementController');
const TimetableController    = require('../adapters/in/http/controllers/TimetableController');

// ── Route factories ──
const createAuthRouter         = require('../adapters/in/http/routes/authRoutes');
const createStudentRouter      = require('../adapters/in/http/routes/studentRoutes');
const createTeacherRouter      = require('../adapters/in/http/routes/teacherRoutes');
const createSectionRouter      = require('../adapters/in/http/routes/sectionRoutes');
const createFeeRouter          = require('../adapters/in/http/routes/feeRoutes');
const createAnnouncementRouter = require('../adapters/in/http/routes/announcementRoutes');
const createTimetableRouter    = require('../adapters/in/http/routes/timetableRoutes');

function buildContainer() {
  // 1. Instantiate repositories
  const userRepo         = new MongoUserRepository();
  const studentRepo      = new MongoStudentRepository();
  const teacherRepo      = new MongoTeacherRepository();
  const sectionRepo      = new MongoSectionRepository();
  const feeRepo          = new MongoFeeRepository();
  const announcementRepo = new MongoAnnouncementRepository();
  const timetableRepo    = new MongoTimetableRepository();

  // 2. Instantiate use cases (inject repos)
  const authUseCases         = new AuthUseCases(userRepo);
  const studentUseCases      = new StudentUseCases(studentRepo, userRepo);
  const teacherUseCases      = new TeacherUseCases(teacherRepo, userRepo);
  const sectionUseCases      = new SectionUseCases(sectionRepo, teacherRepo);
  const feeUseCases          = new FeeUseCases(feeRepo, studentRepo);
  const announcementUseCases = new AnnouncementUseCases(announcementRepo);
  const timetableUseCases    = new TimetableUseCases(timetableRepo, teacherRepo);

  // 3. Instantiate controllers (inject use cases)
  const authController         = new AuthController(authUseCases);
  const studentController      = new StudentController(studentUseCases);
  const teacherController      = new TeacherController(teacherUseCases);
  const sectionController      = new SectionController(sectionUseCases);
  const feeController          = new FeeController(feeUseCases);
  const announcementController = new AnnouncementController(announcementUseCases);
  const timetableController    = new TimetableController(timetableUseCases);

  // 4. Build routers (inject controllers)
  return {
    authRouter:         createAuthRouter(authController),
    studentRouter:      createStudentRouter(studentController),
    teacherRouter:      createTeacherRouter(teacherController),
    sectionRouter:      createSectionRouter(sectionController),
    feeRouter:          createFeeRouter(feeController),
    announcementRouter: createAnnouncementRouter(announcementController),
    timetableRouter:    createTimetableRouter(timetableController),
  };
}

module.exports = buildContainer;
