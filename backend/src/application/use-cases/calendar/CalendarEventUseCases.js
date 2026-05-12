class CalendarEventUseCases {
  constructor(calendarEventRepository) {
    this.calendarRepo = calendarEventRepository;
  }

  async getAllEvents() {
    return this.calendarRepo.findAll();
  }

  async createEvent({ userId, role, date, event, tag }) {
    if (!date || !event) throw new Error('date and event are required');
    return this.calendarRepo.create({ createdBy: userId, role: role || 'teacher', date, event, tag: tag || 'other' });
  }

  async deleteEvent(id) {
    return this.calendarRepo.delete(id);
  }
}

module.exports = CalendarEventUseCases;
