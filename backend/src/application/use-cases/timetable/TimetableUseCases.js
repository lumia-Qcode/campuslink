/**
 * APPLICATION LAYER — Timetable Use Cases
 */
class TimetableUseCases {
  constructor(timetableRepository, teacherRepository) {
    this.timetableRepository = timetableRepository;
    this.teacherRepository   = teacherRepository;
  }

  async getTimetable(classId, section) {
    return this.timetableRepository.findByClassSection(classId, section);
  }

  async getTeacherTimetable(teacherId) {
    return this.timetableRepository.findByTeacher(teacherId);
  }

  async getAllTimetableEntries(filters = {}) {
    return this.timetableRepository.findAll(filters);
  }

  async addEntry(data) {
    const { classId, section, day, period, subject, teacherId, startTime, endTime } = data;

    if (teacherId) {
      const teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) throw new Error('Teacher not found');
    }

    return this.timetableRepository.upsert(classId, section, day, period, {
      classId, section, day, period, subject, teacherId, startTime, endTime,
    });
  }

  async updateEntry(id, data) {
    return this.timetableRepository.update(id, data);
  }

  async deleteEntry(id) {
    return this.timetableRepository.delete(id);
  }

  /**
   * Replace entire timetable for a class-section.
   * Receives array of entries and bulk-upserts.
   */
  async saveTimetable(classId, section, entries) {
    await this.timetableRepository.deleteByClassSection(classId, section);
    const saved = [];
    for (const entry of entries) {
      const result = await this.timetableRepository.create({
        classId,
        section,
        day:       entry.day,
        period:    entry.period,
        subject:   entry.subject,
        teacherId: entry.teacherId || null,
        startTime: entry.startTime,
        endTime:   entry.endTime,
      });
      saved.push(result);
    }
    return saved;
  }
}

module.exports = TimetableUseCases;
