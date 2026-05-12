const StudentModel = require('../../../out/mongodb/models/StudentModel');

class StudentPortalController {
  constructor(studentPortalUseCases) {
    this.uc = studentPortalUseCases;
  }

  // Helper: resolve the student document from the JWT userId
  async _resolveStudent(userId) {
    const student = await StudentModel.findOne({ userId }).lean();
    if (!student) throw new Error('Student profile not found');
    return student;
  }

  // GET /api/student-portal/me
  getMyProfile = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      res.json({ success: true, data: student });
    } catch (err) {
      if (err.message === 'Student profile not found')
        return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  // GET /api/student-portal/attendance
  getMyAttendance = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const records = await this.uc.getAttendance(student._id);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/marks
  getMyMarks = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const marks = await this.uc.getMarks(student._id);
      res.json({ success: true, data: marks });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/fees
  getMyFees = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const fees = await this.uc.getFees(student._id);
      res.json({ success: true, data: fees });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/timetable
  getMyTimetable = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const entries = await this.uc.getTimetable(student.classId, student.section);
      res.json({ success: true, data: entries });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/materials
  getMyMaterials = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const materials = await this.uc.getMaterials(student.classId, student.section);
      res.json({ success: true, data: materials });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/announcements
  getMyAnnouncements = async (req, res, next) => {
    try {
      const student = await this._resolveStudent(req.user.id);
      const announcements = await this.uc.getAnnouncements(student.classId);
      res.json({ success: true, data: announcements });
    } catch (err) { next(err); }
  };

  // GET /api/student-portal/calendar
  getMyCalendarEvents = async (req, res, next) => {
    try {
      const events = await this.uc.getCalendarEvents(req.user.id);
      res.json({ success: true, data: events });
    } catch (err) { next(err); }
  };

  // POST /api/student-portal/calendar
  addCalendarEvent = async (req, res, next) => {
    try {
      const { date, event, tag } = req.body;
      const evt = await this.uc.addCalendarEvent({
        studentUserId: req.user.id,
        date,
        event,
        tag,
      });
      res.status(201).json({ success: true, data: evt });
    } catch (err) {
      if (err.message === 'date and event are required')
        return res.status(400).json({ success: false, message: err.message });
      next(err);
    }
  };

  // DELETE /api/student-portal/calendar/:id
  deleteCalendarEvent = async (req, res, next) => {
    try {
      await this.uc.deleteCalendarEvent(req.params.id, req.user.id);
      res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
      if (err.message === 'Event not found')
        return res.status(404).json({ success: false, message: err.message });
      if (err.message.includes('only delete your own'))
        return res.status(403).json({ success: false, message: err.message });
      next(err);
    }
  };
}

module.exports = StudentPortalController;
