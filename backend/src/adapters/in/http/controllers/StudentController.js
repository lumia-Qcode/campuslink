class StudentController {
  constructor(studentUseCases) {
    this.studentUseCases = studentUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { classId, section, search } = req.query;
      const students = await this.studentUseCases.getAllStudents({ classId, section, search });
      res.json({ success: true, data: students, count: students.length });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const student = await this.studentUseCases.getStudentById(req.params.id);
      res.json({ success: true, data: student });
    } catch (err) {
      if (err.message === 'Student not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const result = await this.studentUseCases.createStudent(req.body);
      res.status(201).json({ success: true, data: result.student, credentials: result.credentials });
    } catch (err) {
      if (err.message.includes('Username already taken')) return res.status(400).json({ success: false, message: err.message });
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const student = await this.studentUseCases.updateStudent(req.params.id, req.body);
      res.json({ success: true, data: student });
    } catch (err) {
      if (err.message === 'Student not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.studentUseCases.deleteStudent(req.params.id);
      res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
      if (err.message === 'Student not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };
}

module.exports = StudentController;
