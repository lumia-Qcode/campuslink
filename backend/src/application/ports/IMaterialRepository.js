/**
 * PORT: IMaterialRepository
 * Interface for accessing learning materials.
 */
class IMaterialRepository {
  /**
   * Return all published materials visible to a given class/section.
   * @param {{ classLevel: number, section: string }} studentInfo
   * @returns {Promise<Array>}
   */
  async findForStudent(studentInfo) { throw new Error('Not implemented'); }

  /**
   * Return a single material by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * Return all materials uploaded by a specific teacher user.
   * @param {string} uploadedByUserId  – User ObjectId string of the teacher
   * @returns {Promise<Array>}
   */
  async findByUploadedByUserId(uploadedByUserId) { throw new Error('Not implemented'); }

  /**
   * Persist a new material record.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(data) { throw new Error('Not implemented'); }

  /**
   * Delete a material by id.
   * @param {string} id
   */
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = IMaterialRepository;
