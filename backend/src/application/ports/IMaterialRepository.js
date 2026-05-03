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
  // eslint-disable-next-line no-unused-vars
  async findForStudent(studentInfo) { throw new Error('Not implemented'); }

  /**
   * Return a single material by its ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) { throw new Error('Not implemented'); }
}

module.exports = IMaterialRepository;
