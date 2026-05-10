class TimetableController {
  constructor(timetableUseCases) {
    this.timetableUseCases = timetableUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { classId, section } = req.query;
      const entries = await this.timetableUseCases.getAllTimetableEntries({ classId, section });
      res.json({ success: true, data: entries, count: entries.length });
    } catch (err) { next(err); }
  };

  getByClassSection = async (req, res, next) => {
    try {
      const { classId, section } = req.params;
      const entries = await this.timetableUseCases.getTimetable(classId, section);
      res.json({ success: true, data: entries });
    } catch (err) { next(err); }
  };

  getByTeacher = async (req, res, next) => {
    try {
      const entries = await this.timetableUseCases.getTeacherTimetable(req.params.teacherId);
      res.json({ success: true, data: entries });
    } catch (err) { next(err); }
  };

  addEntry = async (req, res, next) => {
    try {
      const entry = await this.timetableUseCases.addEntry(req.body);
      res.status(201).json({ success: true, data: entry });
    } catch (err) { next(err); }
  };

  saveTimetable = async (req, res, next) => {
    try {
      const { classId, section, entries } = req.body;
      if (!classId || !section || !Array.isArray(entries)) {
        return res.status(400).json({ success: false, message: 'classId, section, and entries array are required' });
      }
      const saved = await this.timetableUseCases.saveTimetable(classId, section, entries);
      res.json({ success: true, data: saved, count: saved.length });
    } catch (err) { next(err); }
  };

  updateEntry = async (req, res, next) => {
    try {
      const entry = await this.timetableUseCases.updateEntry(req.params.id, req.body);
      res.json({ success: true, data: entry });
    } catch (err) { next(err); }
  };

  deleteEntry = async (req, res, next) => {
    try {
      await this.timetableUseCases.deleteEntry(req.params.id);
      res.json({ success: true, message: 'Entry deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = TimetableController;
