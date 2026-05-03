/**
 * PORT: IStudentRepository
 */
class IStudentRepository {
  async findByUserId(userId)              { throw new Error('Not implemented'); }
  async findById(id)                      { throw new Error('Not implemented'); }
  async findByStudentId(studentId)        { throw new Error('Not implemented'); }
  async create(studentData)               { throw new Error('Not implemented'); }
  async update(id, data)                  { throw new Error('Not implemented'); }

  /**
   * Return all students in a given class + section (used by teacher endpoints).
   * @param {number} classLevel
   * @param {string} section
   * @returns {Promise<Student[]>}
   */
  async findByClassAndSection(classLevel, section) { throw new Error('Not implemented'); }

  /**
   * Return students for a class label such as "10-A".
   * @param {string} classLabel  e.g. "10-A"
   * @returns {Promise<Student[]>}
   */
  async findByClassLabel(classLabel) { throw new Error('Not implemented'); }
}

module.exports = IStudentRepository;
