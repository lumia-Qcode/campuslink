/**
 * USE CASE: GetTeacherMaterials
 * Returns all materials uploaded by the authenticated teacher.
 */
class GetTeacherMaterials {
  constructor(teacherRepository, materialRepository) {
    this.teacherRepo  = teacherRepository;
    this.materialRepo = materialRepository;
  }

  async execute(userId) {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    const materials = await this.materialRepo.findByUploadedByUserId(userId);
    return materials;
  }
}

module.exports = GetTeacherMaterials;
