/**
 * APPLICATION LAYER — Section Use Cases
 */
class SectionUseCases {
  constructor(sectionRepository, teacherRepository) {
    this.sectionRepository = sectionRepository;
    this.teacherRepository = teacherRepository;
  }

  async getAllSections(filters = {}) {
    return this.sectionRepository.findAll(filters);
  }

  async getSectionById(id) {
    const section = await this.sectionRepository.findById(id);
    if (!section) throw new Error('Section not found');
    return section;
  }

  async createSection(data) {
    const { classId, section, subject, teacherId } = data;

    const exists = await this.sectionRepository.exists(classId, section, subject);
    if (exists) throw new Error('This class-section-subject combination already exists');

    if (teacherId) {
      const teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) throw new Error('Assigned teacher not found');
    }

    return this.sectionRepository.create({ classId, section, subject, teacherId, studentCount: 0 });
  }

  async updateSection(id, data) {
    const existing = await this.sectionRepository.findById(id);
    if (!existing) throw new Error('Section not found');
    return this.sectionRepository.update(id, data);
  }

  async deleteSection(id) {
    const existing = await this.sectionRepository.findById(id);
    if (!existing) throw new Error('Section not found');
    return this.sectionRepository.delete(id);
  }
}

module.exports = SectionUseCases;
