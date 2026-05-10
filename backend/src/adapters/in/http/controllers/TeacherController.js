class TeacherController {
  constructor(teacherUseCases) {
    this.teacherUseCases = teacherUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { department, search } = req.query;
      const teachers = await this.teacherUseCases.getAllTeachers({ department, search });
      res.json({ success: true, data: teachers, count: teachers.length });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const teacher = await this.teacherUseCases.getTeacherById(req.params.id);
      res.json({ success: true, data: teacher });
    } catch (err) {
      if (err.message === 'Teacher not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const result = await this.teacherUseCases.createTeacher(req.body);
      res.status(201).json({ success: true, data: result.teacher, credentials: result.credentials });
    } catch (err) {
      if (err.message.includes('Username already taken')) return res.status(400).json({ success: false, message: err.message });
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const teacher = await this.teacherUseCases.updateTeacher(req.params.id, req.body);
      res.json({ success: true, data: teacher });
    } catch (err) {
      if (err.message === 'Teacher not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.teacherUseCases.deleteTeacher(req.params.id);
      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (err) {
      if (err.message === 'Teacher not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };
}

module.exports = TeacherController;
