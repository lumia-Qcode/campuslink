/**
 * USE CASE: DeleteTeacherMaterial
 * Deletes a material, but only if the requesting teacher uploaded it.
 */
class DeleteTeacherMaterial {
  constructor(teacherRepository, materialRepository) {
    this.teacherRepo  = teacherRepository;
    this.materialRepo = materialRepository;
  }

  /**
   * @param {string} userId     – authenticated teacher's User ObjectId
   * @param {string} materialId – Material _id to delete
   */
  async execute(userId, materialId) {
    const teacher = await this.teacherRepo.findByUserId(userId);
    if (!teacher) {
      const err = new Error('Teacher profile not found');
      err.statusCode = 404;
      throw err;
    }

    const material = await this.materialRepo.findById(materialId);
    if (!material) {
      const err = new Error('Material not found');
      err.statusCode = 404;
      throw err;
    }

    // Ownership check — teacher can only delete their own materials
    if (material.uploadedByUserId !== String(userId)) {
      const err = new Error('You can only delete materials you uploaded');
      err.statusCode = 403;
      throw err;
    }

    await this.materialRepo.delete(materialId);
    return { deleted: true, id: materialId };
  }
}

module.exports = DeleteTeacherMaterial;
