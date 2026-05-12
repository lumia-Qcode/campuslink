
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

  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile(userId) {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) throw new Error('Student profile not found');
    return student;
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  /**
   * Returns all attendance records for the student.
   * Groups them by subject+teacher so per-subject percentages can be shown.
   */
  async getAttendance(studentDbId) {
    const records = await this.attendanceRepo.findByStudent(studentDbId);
    return records;
  }

  // ── Marks ─────────────────────────────────────────────────────────────────
  async getMarks(studentDbId) {
    const marks = await this.marksRepo.findByStudent(studentDbId);
    return marks;
  }

  // ── Fees ──────────────────────────────────────────────────────────────────
  async getFees(studentDbId) {
    const fees = await this.feeRepo.findByStudent(studentDbId);
    return fees;
  }

  // ── Timetable ─────────────────────────────────────────────────────────────
  async getTimetable(classId, section) {
    return this.timetableRepo.findByClassSection(classId, section);
  }

  // ── Materials ─────────────────────────────────────────────────────────────
  async getMaterials(classId, section) {
    return this.materialRepo.findByClassSection(classId, section);
  }

  // ── Announcements ─────────────────────────────────────────────────────────
  /**
   * Returns announcements whose targetRoles includes 'student',
   * filtered by targetClasses (empty = all classes).
   */
  async getAnnouncements(classId) {
    return this.announcementRepo.findForStudent(classId);
  }

  // ── Calendar Events ───────────────────────────────────────────────────────
  /**
   * Returns:
   *  1. All teacher/admin calendar events (visible to everyone)
   *  2. The student's own personal events
   */
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
    // Students can only delete their own events
    if (String(evt.createdBy) !== String(studentUserId)) {
      throw new Error('You can only delete your own events');
    }
    return this.calendarRepo.delete(id);
  }
}

module.exports = StudentPortalUseCases;
