/**
 * PORT: IDisciplineRepository
 * Defines the contract the application layer uses to query discipline records.
 * Concrete adapters implement this interface.
 */
class IDisciplineRepository {
  /**
   * Return all DisciplineRecord domain objects for a given student.
   * @param {string} studentId  – ObjectId string of the Student document
   * @returns {Promise<DisciplineRecord[]>}
   */
  async findByStudentId(studentId) { throw new Error('Not implemented'); }

  /**
   * Return the most recent DisciplineRecord for a student.
   * @param {string} studentId
   * @returns {Promise<DisciplineRecord|null>}
   */
  async findLatestByStudentId(studentId) { throw new Error('Not implemented'); }

  /**
   * Persist a new discipline record.
   * @param {object} data
   * @returns {Promise<DisciplineRecord>}
   */
  async create(data) { throw new Error('Not implemented'); }

  /**
   * Update an existing discipline record.
   * @param {string} id
   * @param {object} data
   * @returns {Promise<DisciplineRecord>}
   */
  async update(id, data) { throw new Error('Not implemented'); }
}

module.exports = IDisciplineRepository;
