const TeacherModel = require('../../../out/mongodb/models/TeacherModel');

class MaterialController {
  constructor(materialUseCases) {
    this.materialUseCases = materialUseCases;
  }

  async _getTeacherDbId(userId) {
    const teacher = await TeacherModel.findOne({ userId }).lean();
    if (!teacher) throw new Error('Teacher profile not found');
    return teacher._id;
  }

  // GET /api/materials?classId=&section=&subject=
  getAll = async (req, res, next) => {
    try {
      const { classId, section, subject } = req.query;
      // Teacher sees their own; student sees their class/section
      let filters = {};
      if (req.user.role === 'teacher') {
        const teacherDbId = await this._getTeacherDbId(req.user.id);
        filters.teacherId = teacherDbId;
      }
      if (classId) filters.classId = classId;
      if (section) filters.section = section;
      if (subject) filters.subject = subject;
      const materials = await this.materialUseCases.getMaterials(filters);
      res.json({ success: true, data: materials });
    } catch (err) { next(err); }
  };

  // GET /api/materials/section?classId=&section=  (for students)
  getByClassSection = async (req, res, next) => {
    try {
      const { classId, section } = req.query;
      const materials = await this.materialUseCases.getMaterialsByClassSection(classId, section);
      res.json({ success: true, data: materials });
    } catch (err) { next(err); }
  };

  // POST /api/materials
  upload = async (req, res, next) => {
    try {
      const teacherDbId = await this._getTeacherDbId(req.user.id);
      const { title, subject, classId, section, fileType, fileSize, fileUrl } = req.body;
      const material = await this.materialUseCases.uploadMaterial({
        teacherDbId, title, subject, classId, section, fileType, fileSize, fileUrl,
      });
      res.status(201).json({ success: true, data: material });
    } catch (err) { next(err); }
  };

  // DELETE /api/materials/:id
  delete = async (req, res, next) => {
    try {
      await this.materialUseCases.deleteMaterial(req.params.id);
      res.json({ success: true, message: 'Material deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = MaterialController;
