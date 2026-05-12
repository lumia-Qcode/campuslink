class MaterialUseCases {
  constructor(materialRepository) {
    this.materialRepo = materialRepository;
  }

  async getMaterials(filters = {}) {
    return this.materialRepo.findAll(filters);
  }

  async getMaterialsByClassSection(classId, section) {
    return this.materialRepo.findByClassSection(classId, section);
  }

  async uploadMaterial({ teacherDbId, title, subject, classId, section, fileType, fileSize, fileUrl }) {
    if (!title || !subject || !classId || !section || !fileUrl) {
      throw new Error('title, subject, classId, section, and fileUrl are required');
    }
    return this.materialRepo.create({
      teacherId: teacherDbId,
      title,
      subject,
      classId,
      section,
      fileType: fileType || 'PDF',
      fileSize: fileSize || '',
      fileUrl,
    });
  }

  async deleteMaterial(id) {
    return this.materialRepo.delete(id);
  }
}

module.exports = MaterialUseCases;
