/**
 * USE CASE: GetTeacherTimetable
 * Returns timetable entries for the authenticated teacher's classes.
 * Filters by day if provided.
 */
class GetTeacherTimetable {
  constructor(teacherRepository, timetableRepository) {
    this.teacherRepo   = teacherRepository;
    this.timetableRepo = timetableRepository;
  }

  /**
   * @param {string}  userId  – authenticated teacher User ObjectId
   * @param {string}  [day]   – 'Monday' | 'Tuesday' | … (optional filter)
   */
  async execute(userId, day) {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    // Fetch timetable entries and filter by teacher's name
    const allEntries = day
      ? await this.timetableRepo.findByDay(day)
      : await this.timetableRepo.findAll();

    // Filter to entries belonging to this teacher by name match
    const teacherEntries = allEntries.filter(entry =>
      entry.teacher && entry.teacher.trim().toLowerCase().includes(teacher.name.trim().toLowerCase())
    );

    return { teacher: teacher.name, day: day || 'All', entries: teacherEntries };
  }
}

module.exports = GetTeacherTimetable;
