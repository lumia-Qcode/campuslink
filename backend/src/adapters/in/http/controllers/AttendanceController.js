const TeacherModel = require('../../../out/mongodb/models/TeacherModel');

class AttendanceController {
  constructor(attendanceUseCases) {
    this.attendanceUseCases = attendanceUseCases;
  }

  // Helper: get teacher's DB _id from their user id (JWT)
  async _getTeacherDbId(userId) {
    const teacher = await TeacherModel.findOne({ userId }).lean();
    if (!teacher) throw new Error('Teacher profile not found');
    return teacher._id;S
  }

  // POST /api/attendance  — save attendance for a class/section/date
  save = async (req, res, next) => {
    try {
      const { classId, section, date, records } = req.body;
      const teacherDbId = await this._getTeacherDbId(req.user.id);
      const result = await this.attendanceUseCases.saveAttendance({
        teacherDbId, classId, section, date, records,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  // GET /api/attendance?classId=&section=&date=
  getForDate = async (req, res, next) => {
    try {
      const { classId, section, date } = req.query;
      if (!classId || !section || !date) {
        return res.status(400).json({ success: false, message: 'classId, section, and date are required' });
      }
      const records = await this.attendanceUseCases.getAttendanceForDate(classId, section, date);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };

  // GET /api/attendance/dates?classId=&section=
  getDates = async (req, res, next) => {
    try {
      const { classId, section } = req.query;
      const dates = await this.attendanceUseCases.getAttendanceDates(classId, section);
      res.json({ success: true, data: dates });
    } catch (err) { next(err); }
  };

  // GET /api/attendance/report?classId=&section=&from=&to=
  getReport = async (req, res, next) => {
    try {
      const { classId, section, from, to } = req.query;
      const records = await this.attendanceUseCases.getAttendanceReport(classId, section, from, to);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };

  // GET /api/attendance/student/:studentId
  getStudentAttendance = async (req, res, next) => {
    try {
      const records = await this.attendanceUseCases.getStudentAttendance(req.params.studentId);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };
}

module.exports = AttendanceController;
