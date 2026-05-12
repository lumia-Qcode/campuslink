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

    let teacher = null;
    if (teacherId) {
      teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) throw new Error('Assigned teacher not found');
    }

    // Check if this class-section-subject already exists
    const existing = await this.sectionRepository.findExact(classId, section, subject);

    let savedSection;
    if (existing) {
      // Section already exists — just update the teacherId assignment on it
      // (this handles the case where admin assigns a teacher to a pre-existing section)
      const oldTeacherId = existing.teacherId ? existing.teacherId.toString() : null;
      const newTeacherId = teacherId ? teacherId.toString() : null;

      if (oldTeacherId && oldTeacherId !== newTeacherId) {
        // Remove from old teacher's array
        await this.teacherRepository.removeAssignedSection(oldTeacherId, existing._id);
      }

      savedSection = await this.sectionRepository.update(existing._id, { teacherId });
    } else {
      // Create a brand-new section
      savedSection = await this.sectionRepository.create({
        classId, section, subject, teacherId, studentCount: 0,
      });
    }

    // Add to teacher's assignedSections array (idempotent with $addToSet)
    if (teacherId && teacher) {
      await this.teacherRepository.addAssignedSection(teacherId, savedSection._id);
    }

    return savedSection;
  }

  async updateSection(id, data) {
    const existing = await this.sectionRepository.findById(id);
    if (!existing) throw new Error('Section not found');

    const oldTeacherId = existing.teacherId ? existing.teacherId.toString() : null;
    const newTeacherId = data.teacherId ? data.teacherId.toString() : null;

    if (oldTeacherId !== newTeacherId) {
      if (oldTeacherId) {
        await this.teacherRepository.removeAssignedSection(oldTeacherId, id);
      }
      if (newTeacherId) {
        const newTeacher = await this.teacherRepository.findById(newTeacherId);
        if (!newTeacher) throw new Error('Assigned teacher not found');
        await this.teacherRepository.addAssignedSection(newTeacherId, id);
      }
    }

    return this.sectionRepository.update(id, data);
  }

  async deleteSection(id) {
    const existing = await this.sectionRepository.findById(id);
    if (!existing) throw new Error('Section not found');

    if (existing.teacherId) {
      await this.teacherRepository.removeAssignedSection(
        existing.teacherId.toString(), id
      );
    }

    return this.sectionRepository.delete(id);
  }
}

module.exports = SectionUseCases;
