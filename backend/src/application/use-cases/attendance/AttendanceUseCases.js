class AttendanceUseCases {
  constructor(attendanceRepository, studentRepository, teacherRepository) {
    this.attendanceRepo = attendanceRepository;
    this.studentRepo    = studentRepository;
    this.teacherRepo    = teacherRepository;
  }

  // Save attendance for an entire class on a date
  // records: [{ studentId, status }], teacherId from JWT
  async saveAttendance({ teacherDbId, classId, section, date, records }) {
    if (!teacherDbId || !classId || !section || !date || !records?.length) {
      throw new Error('teacherDbId, classId, section, date, and records are required');
    }
    const batch = records.map(r => ({
      teacherId: teacherDbId,
      studentId: r.studentId,
      classId,
      section,
      date,
      status: r.status,
    }));
    await this.attendanceRepo.saveAttendanceBatch(batch);
    return { saved: batch.length };
  }

  // Get existing attendance for a class/section/date
  async getAttendanceForDate(classId, section, date) {
    return this.attendanceRepo.findByClassDate(classId, section, date);
  }

  // Get all dates that have been recorded for a class/section
  async getAttendanceDates(classId, section) {
    return this.attendanceRepo.findDatesForClass(classId, section);
  }

  // Report: attendance for a student
  async getStudentAttendance(studentId) {
    return this.attendanceRepo.findByStudent(studentId);
  }

  // Report: attendance for a class in a date range
  async getAttendanceReport(classId, section, fromDate, toDate) {
    return this.attendanceRepo.findByClassDateRange(classId, section, fromDate, toDate);
  }
}

module.exports = AttendanceUseCases;
