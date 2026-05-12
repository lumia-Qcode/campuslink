class SectionController {
  constructor(sectionUseCases) {
    this.sectionUseCases = sectionUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { classId, search } = req.query;
      const sections = await this.sectionUseCases.getAllSections({ classId, search });
      res.json({ success: true, data: sections, count: sections.length });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const section = await this.sectionUseCases.getSectionById(req.params.id);
      res.json({ success: true, data: section });
    } catch (err) {
      if (err.message === 'Section not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const section = await this.sectionUseCases.createSection(req.body);
      res.status(201).json({ success: true, data: section });
    } catch (err) {
      if (err.message.includes('already exists')) return res.status(400).json({ success: false, message: err.message });
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const section = await this.sectionUseCases.updateSection(req.params.id, req.body);
      res.json({ success: true, data: section });
    } catch (err) {
      if (err.message === 'Section not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.sectionUseCases.deleteSection(req.params.id);
      res.json({ success: true, message: 'Section deleted successfully' });
    } catch (err) {
      if (err.message === 'Section not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };
}

module.exports = SectionController;
