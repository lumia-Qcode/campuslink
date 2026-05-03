/**
 * INFRASTRUCTURE ADAPTER: teacherController
 *
 * HTTP controllers for all teacher-facing endpoints.
 * Follows Hexagonal Architecture — thin adapters that translate HTTP
 * requests into use-case calls and format responses.
 *
 * All user input is sanitised by teacherValidators.js BEFORE reaching here.
 */

// ── Use-case imports ──────────────────────────────────────────────────────────
const GetTeacherDashboard     = require('../../../application/use-cases/teacher/GetTeacherDashboard');
const GetTeacherProfile       = require('../../../application/use-cases/teacher/GetTeacherProfile');
const GetTeacherStudents      = require('../../../application/use-cases/teacher/GetTeacherStudents');
const GetTeacherAttendance    = require('../../../application/use-cases/teacher/GetTeacherAttendance');
const SaveTeacherAttendance   = require('../../../application/use-cases/teacher/SaveTeacherAttendance');
const GetTeacherMarks         = require('../../../application/use-cases/teacher/GetTeacherMarks');
const SaveTeacherMarks        = require('../../../application/use-cases/teacher/SaveTeacherMarks');
const GetTeacherMaterials     = require('../../../application/use-cases/teacher/GetTeacherMaterials');
const UploadTeacherMaterial   = require('../../../application/use-cases/teacher/UploadTeacherMaterial');
const DeleteTeacherMaterial   = require('../../../application/use-cases/teacher/DeleteTeacherMaterial');
const GetTeacherTimetable     = require('../../../application/use-cases/teacher/GetTeacherTimetable');
const GetTeacherAnnouncements = require('../../../application/use-cases/teacher/GetTeacherAnnouncements');
const GetTeacherCalendar      = require('../../../application/use-cases/teacher/GetTeacherCalendar');

// ── Repository imports ────────────────────────────────────────────────────────
const MongoTeacherRepository      = require('../../database/repositories/MongoTeacherRepository');
const MongoStudentRepository      = require('../../database/repositories/MongoStudentRepository');
const MongoMarkRepository         = require('../../database/repositories/MongoMarkRepository');
const MongoAnnouncementRepository = require('../../database/repositories/MongoAnnouncementRepository');
const MongoAttendanceRepository   = require('../../database/repositories/MongoAttendanceRepository');
const MongoTimetableRepository    = require('../../database/repositories/MongoTimetableRepository');
const MongoCalendarRepository     = require('../../database/repositories/MongoCalendarRepository');
const MongoMaterialRepository     = require('../../database/repositories/MongoMaterialRepository');

// ── Dependency injection (Composition Root) ───────────────────────────────────
const teacherRepo      = new MongoTeacherRepository();
const studentRepo      = new MongoStudentRepository();
const markRepo         = new MongoMarkRepository();
const announcementRepo = new MongoAnnouncementRepository();
const attendanceRepo   = new MongoAttendanceRepository();
const timetableRepo    = new MongoTimetableRepository();
const calendarRepo     = new MongoCalendarRepository();
const materialRepo     = new MongoMaterialRepository();

const dashboardUseCase      = new GetTeacherDashboard(teacherRepo, studentRepo, markRepo, announcementRepo);
const profileUseCase        = new GetTeacherProfile(teacherRepo);
const studentsUseCase       = new GetTeacherStudents(teacherRepo, studentRepo);
const getAttendanceUseCase  = new GetTeacherAttendance(teacherRepo, studentRepo, attendanceRepo);
const saveAttendanceUseCase = new SaveTeacherAttendance(teacherRepo, studentRepo, attendanceRepo);
const getMarksUseCase       = new GetTeacherMarks(teacherRepo, studentRepo, markRepo);
const saveMarksUseCase      = new SaveTeacherMarks(teacherRepo, studentRepo, markRepo);
const getMaterialsUseCase   = new GetTeacherMaterials(teacherRepo, materialRepo);
const uploadMaterialUseCase = new UploadTeacherMaterial(teacherRepo, materialRepo);
const deleteMaterialUseCase = new DeleteTeacherMaterial(teacherRepo, materialRepo);
const timetableUseCase      = new GetTeacherTimetable(teacherRepo, timetableRepo);
const announcementsUseCase  = new GetTeacherAnnouncements(announcementRepo);
const calendarUseCase       = new GetTeacherCalendar(calendarRepo);

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/teacher/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const data = await profileUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/students?class=10-A
 */
const getStudents = async (req, res, next) => {
  try {
    const { class: classLabel } = req.query;
    const data = await studentsUseCase.execute(req.user.sub, classLabel);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/attendance?class=10-A&date=2026-05-01
 */
const getAttendance = async (req, res, next) => {
  try {
    const { class: classLabel, date } = req.query;
    const data = await getAttendanceUseCase.execute(req.user.sub, classLabel, date);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * POST /api/teacher/attendance
 * Body: { class, date, records: [{ studentId, status, note? }] }
 */
const saveAttendance = async (req, res, next) => {
  try {
    const { class: classLabel, date, records } = req.body;
    const data = await saveAttendanceUseCase.execute(req.user.sub, classLabel, date, records);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/marks?class=10-A&subject=Mathematics&component=MidTerm - I
 */
const getMarks = async (req, res, next) => {
  try {
    const { class: classLabel, subject, component } = req.query;
    const data = await getMarksUseCase.execute(req.user.sub, classLabel, subject, component);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * POST /api/teacher/marks
 * Body: { class, subject, component, entries: [{ studentId, marks, total, examDate? }] }
 */
const saveMarks = async (req, res, next) => {
  try {
    const { class: classLabel, subject, component, entries } = req.body;
    const data = await saveMarksUseCase.execute(req.user.sub, classLabel, subject, component, entries);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/materials
 */
const getMaterials = async (req, res, next) => {
  try {
    const data = await getMaterialsUseCase.execute(req.user.sub);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * POST /api/teacher/materials
 * Body: { title, subject, type, fileUrl, downloadUrl, size, targetClass, targetSection }
 */
const uploadMaterial = async (req, res, next) => {
  try {
    const data = await uploadMaterialUseCase.execute(req.user.sub, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/teacher/materials/:id
 */
const deleteMaterial = async (req, res, next) => {
  try {
    const data = await deleteMaterialUseCase.execute(req.user.sub, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/timetable?day=Monday
 */
const getTimetable = async (req, res, next) => {
  try {
    const { day } = req.query;
    const data = await timetableUseCase.execute(req.user.sub, day);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/announcements?tag=urgent
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const { tag } = req.query;
    const data = await announcementsUseCase.execute(tag);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/teacher/calendar?month=May 2026&type=exam
 */
const getCalendar = async (req, res, next) => {
  try {
    const { month, type } = req.query;
    const data = await calendarUseCase.execute(month, type);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard,
  getProfile,
  getStudents,
  getAttendance,
  saveAttendance,
  getMarks,
  saveMarks,
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  getTimetable,
  getAnnouncements,
  getCalendar,
};
