/**
 * INFRASTRUCTURE ADAPTER: studentController
 *
 * HTTP controllers for all student-facing endpoints.
 * Follows Hexagonal Architecture — controllers are thin adapters that
 * translate HTTP requests into use-case calls and format the response.
 *
 * All user input is sanitised by validators.js BEFORE reaching these functions.
 */

const GetStudentDashboard      = require('../../../application/use-cases/student/GetStudentDashboard');
const GetStudentMarks          = require('../../../application/use-cases/student/GetStudentMarks');
const GetStudentAttendance     = require('../../../application/use-cases/student/GetStudentAttendance');
const GetStudentTimetable      = require('../../../application/use-cases/student/GetStudentTimetable');
const GetStudentCalendar       = require('../../../application/use-cases/student/GetStudentCalendar');
const GetStudentDiscipline     = require('../../../application/use-cases/student/GetStudentDiscipline');
const GetStudentMaterials      = require('../../../application/use-cases/student/GetStudentMaterials');
const GetStudentActivities     = require('../../../application/use-cases/student/GetStudentActivities');
const GetStudentAnnouncements  = require('../../../application/use-cases/student/GetStudentAnnouncements');

const MongoStudentRepository      = require('../../database/repositories/MongoStudentRepository');
const MongoMarkRepository         = require('../../database/repositories/MongoMarkRepository');
const MongoAnnouncementRepository = require('../../database/repositories/MongoAnnouncementRepository');
const MongoAttendanceRepository   = require('../../database/repositories/MongoAttendanceRepository');
const MongoTimetableRepository    = require('../../database/repositories/MongoTimetableRepository');
const MongoCalendarRepository     = require('../../database/repositories/MongoCalendarRepository');
const MongoDisciplineRepository   = require('../../database/repositories/MongoDisciplineRepository');
const MongoMaterialRepository     = require('../../database/repositories/MongoMaterialRepository');
const MongoActivityRepository     = require('../../database/repositories/MongoActivityRepository');

// ── Dependency injection (Composition Root) ───────────────────────────────────

const studentRepo      = new MongoStudentRepository();
const markRepo         = new MongoMarkRepository();
const announcementRepo = new MongoAnnouncementRepository();
const attendanceRepo   = new MongoAttendanceRepository();
const timetableRepo    = new MongoTimetableRepository();
const calendarRepo     = new MongoCalendarRepository();
const disciplineRepo   = new MongoDisciplineRepository();
const materialRepo     = new MongoMaterialRepository();
const activityRepo     = new MongoActivityRepository();

const dashboardUseCase      = new GetStudentDashboard(studentRepo, markRepo, announcementRepo);
const marksUseCase          = new GetStudentMarks(studentRepo, markRepo);
const attendanceUseCase     = new GetStudentAttendance(studentRepo, attendanceRepo);
const timetableUseCase      = new GetStudentTimetable(studentRepo, timetableRepo);
const calendarUseCase       = new GetStudentCalendar(calendarRepo);
const disciplineUseCase     = new GetStudentDiscipline(studentRepo, disciplineRepo);
const materialsUseCase      = new GetStudentMaterials(studentRepo, materialRepo);
const activitiesUseCase     = new GetStudentActivities(studentRepo, activityRepo);
const announcementsUseCase  = new GetStudentAnnouncements(announcementRepo);

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/student/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/marks?component=MidTerm+-+I
 */
const getMarks = async (req, res, next) => {
  try {
    const { component } = req.query;
    const data = await marksUseCase.execute(req.user.sub, { component });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const student = await studentRepo.findByUserId(req.user.sub);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/attendance?status=Present&month=March+2026
 */
const getAttendance = async (req, res, next) => {
  try {
    const { status, month } = req.query;
    const data = await attendanceUseCase.execute(req.user.sub, { status, month });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/timetable?day=Monday
 */
const getTimetable = async (req, res, next) => {
  try {
    const { day } = req.query;
    const data = await timetableUseCase.execute(req.user.sub, { day });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/calendar?month=April+2026&type=exam
 */
const getCalendar = async (req, res, next) => {
  try {
    const { month, type } = req.query;
    const data = await calendarUseCase.execute({ month, type });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/discipline
 */
const getDiscipline = async (req, res, next) => {
  try {
    const data = await disciplineUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/materials?subject=Mathematics
 */
const getMaterials = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const data = await materialsUseCase.execute(req.user.sub, { subject });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/activities
 */
const getActivities = async (req, res, next) => {
  try {
    const data = await activitiesUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/announcements?tag=urgent
 *
 * Returns all announcements targeting the student role,
 * optionally filtered by tag. Delegates to GetStudentAnnouncements use case
 * which handles role-based filtering and tag counts.
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const { tag } = req.query;
    // Use the dedicated use case for proper role filtering
    const data = await announcementsUseCase.execute({ tag });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/fees
 */
const getFees = async (req, res, next) => {
  try {
    const student = await studentRepo.findByUserId(req.user.sub);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const total     = 25000;
    const paid      = student.feeStatus === 'Paid'    ? 25000
                    : student.feeStatus === 'Overdue' ? 0
                    : 12500;
    const remaining = total - paid;
    res.status(200).json({
      success: true,
      data: {
        studentId: student.studentId,
        challan:   'Spring 2026',
        status:    student.feeStatus || 'Paid',
        total,
        paid,
        remaining,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getMarks,
  getProfile,
  getAttendance,
  getTimetable,
  getCalendar,
  getDiscipline,
  getMaterials,
  getActivities,
  getAnnouncements,
  getFees,
};
