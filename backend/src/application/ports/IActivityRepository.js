/**
 * PORT: IActivityRepository
 * Interface for accessing student extra-curricular activities.
 */
class IActivityRepository {
  /**
   * Return all activities for a given student.
   * @param {string} studentId  – MongoDB ObjectId string
   * @returns {Promise<Array>}
   */
  // eslint-disable-next-line no-unused-vars
  async findByStudentId(studentId) { throw new Error('Not implemented'); }
}

module.exports = IActivityRepository;
