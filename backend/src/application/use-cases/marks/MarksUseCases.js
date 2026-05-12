class MarksUseCases {
  constructor(marksRepository) {
    this.marksRepo = marksRepository;
  }

  async saveMarks({ teacherDbId, classId, section, subject, component, total, records }) {
    if (!teacherDbId || !classId || !section || !subject || !component || !records?.length) {
      throw new Error('All fields are required');
    }
    const batch = records.map(r => ({
      teacherId: teacherDbId,
      studentId: r.studentId,
      classId,
      section,
      subject,
      component,
      marks: r.marks,
      total: total || 100,
    }));
    await this.marksRepo.saveMarksBatch(batch);
    return { saved: batch.length };
  }

  async getMarksForClassSubjectComponent(classId, section, subject, component) {
    return this.marksRepo.findByClassSubjectComponent(classId, section, subject, component);
  }

  async getMarksForClass(classId, section) {
    return this.marksRepo.findByClass(classId, section);
  }

  async getStudentMarks(studentId) {
    return this.marksRepo.findByStudent(studentId);
  }
}

module.exports = MarksUseCases;
