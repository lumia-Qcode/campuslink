// ── Repositories (adapters/out) ──────────────────────────────────────────────
const MongoUserRepository          = require('../../adapters/out/mongodb/repositories/MongoUserRepository');
const MongoStudentRepository       = require('../../adapters/out/mongodb/repositories/MongoStudentRepository');
const MongoTeacherRepository       = require('../../adapters/out/mongodb/repositories/MongoTeacherRepository');
const MongoSectionRepository       = require('../../adapters/out/mongodb/repositories/MongoSectionRepository');
const MongoFeeRepository           = require('../../adapters/out/mongodb/repositories/MongoFeeRepository');
const MongoAnnouncementRepository  = require('../../adapters/out/mongodb/repositories/MongoAnnouncementRepository');
const MongoTimetableRepository     = require('../../adapters/out/mongodb/repositories/MongoTimetableRepository');
const MongoAttendanceRepository    = require('../../adapters/out/mongodb/repositories/MongoAttendanceRepository');
const MongoMarksRepository         = require('../../adapters/out/mongodb/repositories/MongoMarksRepository');
const MongoMaterialRepository      = require('../../adapters/out/mongodb/repositories/MongoMaterialRepository');
const MongoCalendarEventRepository = require('../../adapters/out/mongodb/repositories/MongoCalendarEventRepository');

// ── Use Cases (application) ──────────────────────────────────────────────────
const AuthUseCases          = require('../../application/use-cases/auth/AuthUseCases');
const StudentUseCases       = require('../../application/use-cases/students/StudentUseCases');
const TeacherUseCases       = require('../../application/use-cases/teachers/TeacherUseCases');
const SectionUseCases       = require('../../application/use-cases/sections/SectionUseCases');
const FeeUseCases           = require('../../application/use-cases/fees/FeeUseCases');
const AnnouncementUseCases  = require('../../application/use-cases/announcements/AnnouncementUseCases');
const TimetableUseCases     = require('../../application/use-cases/timetable/TimetableUseCases');
const AttendanceUseCases    = require('../../application/use-cases/attendance/AttendanceUseCases');
const MarksUseCases         = require('../../application/use-cases/marks/MarksUseCases');
const MaterialUseCases      = require('../../application/use-cases/materials/MaterialUseCases');
const CalendarEventUseCases = require('../../application/use-cases/calendar/CalendarEventUseCases');
const StudentPortalUseCases = require('../../application/use-cases/studentPortal/StudentPortalUseCases');

// ── Controllers (adapters/in) ─────────────────────────────────────────────────
const AuthController          = require('../../adapters/in/http/controllers/AuthController');
const StudentController       = require('../../adapters/in/http/controllers/StudentController');
const TeacherController       = require('../../adapters/in/http/controllers/TeacherController');
const SectionController       = require('../../adapters/in/http/controllers/SectionController');
const FeeController           = require('../../adapters/in/http/controllers/FeeController');
const AnnouncementController  = require('../../adapters/in/http/controllers/AnnouncementController');
const TimetableController     = require('../../adapters/in/http/controllers/TimetableController');
const AttendanceController    = require('../../adapters/in/http/controllers/AttendanceController');
const MarksController         = require('../../adapters/in/http/controllers/MarksController');
const MaterialController      = require('../../adapters/in/http/controllers/MaterialController');
const CalendarEventController = require('../../adapters/in/http/controllers/CalendarEventController');
const StudentPortalController = require('../../adapters/in/http/controllers/StudentPortalController');

// ── Routes ────────────────────────────────────────────────────────────────────
const createAuthRouter          = require('../../adapters/in/http/routes/authRoutes');
const createStudentRouter       = require('../../adapters/in/http/routes/studentRoutes');
const createTeacherRouter       = require('../../adapters/in/http/routes/teacherRoutes');
const createSectionRouter       = require('../../adapters/in/http/routes/sectionRoutes');
const createFeeRouter           = require('../../adapters/in/http/routes/feeRoutes');
const createAnnouncementRouter  = require('../../adapters/in/http/routes/announcementRoutes');
const createTimetableRouter     = require('../../adapters/in/http/routes/timetableRoutes');
const createAttendanceRouter    = require('../../adapters/in/http/routes/attendanceRoutes');
const createMarksRouter         = require('../../adapters/in/http/routes/marksRoutes');
const createMaterialRouter      = require('../../adapters/in/http/routes/materialRoutes');
const createCalendarEventRouter = require('../../adapters/in/http/routes/calendarEventRoutes');
const createStudentPortalRouter = require('../../adapters/in/http/routes/studentPortalRoutes');

function buildContainer() {
  // ── Repositories ────────────────────────────────────────────────────────────
  const userRepo              = new MongoUserRepository();
  const studentRepo           = new MongoStudentRepository();
  const teacherRepo           = new MongoTeacherRepository();
  const sectionRepo           = new MongoSectionRepository();
  const feeRepo               = new MongoFeeRepository();
  const announcementRepo      = new MongoAnnouncementRepository();
  const timetableRepo         = new MongoTimetableRepository();
  const attendanceRepo        = new MongoAttendanceRepository();
  const marksRepo             = new MongoMarksRepository();
  const materialRepo          = new MongoMaterialRepository();
  const calendarEventRepo     = new MongoCalendarEventRepository();

  // ── Use Cases ───────────────────────────────────────────────────────────────
  const authUseCases          = new AuthUseCases(userRepo);
  const studentUseCases       = new StudentUseCases(studentRepo, userRepo);
  const teacherUseCases       = new TeacherUseCases(teacherRepo, userRepo, sectionRepo);
  const sectionUseCases       = new SectionUseCases(sectionRepo, teacherRepo);
  const feeUseCases           = new FeeUseCases(feeRepo, studentRepo);
  const announcementUseCases  = new AnnouncementUseCases(announcementRepo);
  const timetableUseCases     = new TimetableUseCases(timetableRepo, teacherRepo);
  const attendanceUseCases    = new AttendanceUseCases(attendanceRepo, studentRepo, teacherRepo);
  const marksUseCases         = new MarksUseCases(marksRepo);
  const materialUseCases      = new MaterialUseCases(materialRepo);
  const calendarEventUseCases = new CalendarEventUseCases(calendarEventRepo);

  
  const studentPortalUseCases = new StudentPortalUseCases({
    studentRepository:      studentRepo,
    attendanceRepository:   attendanceRepo,
    marksRepository:        marksRepo,
    feeRepository:          feeRepo,
    timetableRepository:    timetableRepo,
    materialRepository:     materialRepo,
    announcementRepository: announcementRepo,
    calendarEventRepository: calendarEventRepo,
  });

  // ── Controllers ─────────────────────────────────────────────────────────────
  const authController          = new AuthController(authUseCases);
  const studentController       = new StudentController(studentUseCases);
  const teacherController       = new TeacherController(teacherUseCases);
  const sectionController       = new SectionController(sectionUseCases);
  const feeController           = new FeeController(feeUseCases);
  const announcementController  = new AnnouncementController(announcementUseCases);
  const timetableController     = new TimetableController(timetableUseCases);
  const attendanceController    = new AttendanceController(attendanceUseCases);
  const marksController         = new MarksController(marksUseCases);
  const materialController      = new MaterialController(materialUseCases);
  const calendarEventController = new CalendarEventController(calendarEventUseCases);
  const studentPortalController = new StudentPortalController(studentPortalUseCases);

  // ── Routes ──────────────────────────────────────────────────────────────────
  return {
    authRouter:           createAuthRouter(authController),
    studentRouter:        createStudentRouter(studentController),
    teacherRouter:        createTeacherRouter(teacherController),
    sectionRouter:        createSectionRouter(sectionController),
    feeRouter:            createFeeRouter(feeController),
    announcementRouter:   createAnnouncementRouter(announcementController),
    timetableRouter:      createTimetableRouter(timetableController),
    attendanceRouter:     createAttendanceRouter(attendanceController),
    marksRouter:          createMarksRouter(marksController),
    materialRouter:       createMaterialRouter(materialController),
    calendarEventRouter:  createCalendarEventRouter(calendarEventController),
    studentPortalRouter:  createStudentPortalRouter(studentPortalController), 
  };
}

module.exports = buildContainer;
