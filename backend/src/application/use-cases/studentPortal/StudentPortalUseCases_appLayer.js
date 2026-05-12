class StudentPortalUseCases {
  constructor({
    studentRepository,
    attendanceRepository,
    marksRepository,
    feeRepository,
    timetableRepository,
    materialRepository,
    announcementRepository,
    calendarEventRepository,
  }) {
    this.studentRepo      = studentRepository;
    this.attendanceRepo   = attendanceRepository;
    this.marksRepo        = marksRepository;
    this.feeRepo          = feeRepository;
    this.timetableRepo    = timetableRepository;
    this.materialRepo     = materialRepository;
    this.announcementRepo = announcementRepository;
    this.calendarRepo     = calendarEventRepository;
  }

  async getProfile(userId) {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) throw new Error('Student profile not found');
    return student;
  }

  async getAttendance(studentDbId) {
    return this.attendanceRepo.findByStudent(studentDbId);
  }

  async getMarks(studentDbId) {
    return this.marksRepo.findByStudent(studentDbId);
  }

  async getFees(studentDbId) {
    return this.feeRepo.findByStudent(studentDbId);
  }

  async getTimetable(classId, section) {
    return this.timetableRepo.findByClassSection(classId, section);
  }

  async getMaterials(classId, section) {
    return this.materialRepo.findByClassSection(classId, section);
  }

  async getAnnouncements(classId) {
    return this.announcementRepo.findForStudent(classId);
  }

  async getCalendarEvents(studentUserId) {
    return this.calendarRepo.findForStudent(studentUserId);
  }

  async addCalendarEvent({ studentUserId, date, event, tag }) {
    if (!date || !event) throw new Error('date and event are required');
    return this.calendarRepo.create({
      createdBy: studentUserId,
      role: 'student',
      date,
      event,
      tag: tag || 'other',
    });
  }

  async deleteCalendarEvent(id, studentUserId) {
    const evt = await this.calendarRepo.findById(id);
    if (!evt) throw new Error('Event not found');
    if (String(evt.createdBy) !== String(studentUserId)) {
      throw new Error('You can only delete your own events');
    }
    return this.calendarRepo.delete(id);
  }
}

module.exports = StudentPortalUseCases;
