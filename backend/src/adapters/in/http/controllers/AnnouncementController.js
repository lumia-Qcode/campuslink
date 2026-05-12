class AnnouncementController {
  constructor(announcementUseCases) {
    this.announcementUseCases = announcementUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const { search, role } = req.query;
      let announcements;
      // If ?role=student or ?role=teacher → used by those portals later
      if (role) {
        announcements = await this.announcementUseCases.getAnnouncementsForRole(role);
      } else {
        announcements = await this.announcementUseCases.getAllAnnouncements({ search });
      }
      res.json({ success: true, data: announcements, count: announcements.length });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const ann = await this.announcementUseCases.getAnnouncementById(req.params.id);
      res.json({ success: true, data: ann });
    } catch (err) {
      if (err.message === 'Announcement not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const ann = await this.announcementUseCases.createAnnouncement(req.body, req.user.id);
      res.status(201).json({ success: true, data: ann });
    } catch (err) {
      if (err.message.includes('required')) return res.status(400).json({ success: false, message: err.message });
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const ann = await this.announcementUseCases.updateAnnouncement(req.params.id, req.body);
      res.json({ success: true, data: ann });
    } catch (err) {
      if (err.message === 'Announcement not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      // Teachers can only delete their own announcements; admins can delete any
      if (req.user.role === 'teacher') {
        const ann = await this.announcementUseCases.getAnnouncementById(req.params.id);
        if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
        if (String(ann.postedBy) !== String(req.user.id)) {
          return res.status(403).json({ success: false, message: 'Cannot delete another user\'s announcement' });
        }
      }
      await this.announcementUseCases.deleteAnnouncement(req.params.id);
      res.json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
      if (err.message === 'Announcement not found') return res.status(404).json({ success: false, message: err.message });
      next(err);
    }
  };
}

module.exports = AnnouncementController;