const TeacherModel = require('../../../out/mongodb/models/TeacherModel');

class MarksController {
  constructor(marksUseCases) {
    this.marksUseCases = marksUseCases;
  }

  async _getTeacherDbId(userId) {
    const teacher = await TeacherModel.findOne({ userId }).lean();
    if (!teacher) throw new Error('Teacher profile not found');
    return teacher._id;
  }

  // POST /api/marks — save marks batch
  save = async (req, res, next) => {
    try {
      const { classId, section, subject, component, total, records } = req.body;
      const teacherDbId = await this._getTeacherDbId(req.user.id);
      const result = await this.marksUseCases.saveMarks({
        teacherDbId, classId, section, subject, component, total, records,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  // GET /api/marks?classId=&section=&subject=&component=
  get = async (req, res, next) => {
    try {
      const { classId, section, subject, component } = req.query;
      const records = await this.marksUseCases.getMarksForClassSubjectComponent(classId, section, subject, component);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };

  // GET /api/marks/class?classId=&section=
  getForClass = async (req, res, next) => {
    try {
      const { classId, section } = req.query;
      const records = await this.marksUseCases.getMarksForClass(classId, section);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };

  // GET /api/marks/student/:studentId
  getForStudent = async (req, res, next) => {
    try {
      const records = await this.marksUseCases.getStudentMarks(req.params.studentId);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  };
}

module.exports = MarksController;
