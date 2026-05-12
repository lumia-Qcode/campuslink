class CalendarEventController {
  constructor(calendarEventUseCases) {
    this.calendarEventUseCases = calendarEventUseCases;
  }

  getAll = async (req, res, next) => {
    try {
      const events = await this.calendarEventUseCases.getAllEvents();
      res.json({ success: true, data: events });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const { date, event, tag } = req.body;
      const evt = await this.calendarEventUseCases.createEvent({
        userId: req.user.id,
        role:   req.user.role,
        date,
        event,
        tag,
      });
      res.status(201).json({ success: true, data: evt });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.calendarEventUseCases.deleteEvent(req.params.id);
      res.json({ success: true, message: 'Event deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = CalendarEventController;
