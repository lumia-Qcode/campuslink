/**
 * PORT: IMarkRepository
 */
class IMarkRepository {
  async findByStudentId(studentId)                   { throw new Error('Not implemented'); }
  async findByStudentIdAndComponent(studentId, comp) { throw new Error('Not implemented'); }
  async findById(id)                                 { throw new Error('Not implemented'); }
  async create(markData)                             { throw new Error('Not implemented'); }
  async update(id, data)                             { throw new Error('Not implemented'); }
  async delete(id)                                   { throw new Error('Not implemented'); }

  /**
   * Upsert a mark for a student/subject/component triplet.
   * Used by teachers to save marks — prevents duplicates.
   * @param {string} studentId
   * @param {string} subject
   * @param {string} component
   * @param {number} marks
   * @param {number} total
   * @param {Date}   [examDate]
   * @returns {Promise<Mark>}
   */
  async upsertMark(studentId, subject, component, marks, total, examDate) {
    throw new Error('Not implemented');
  }

  /**
   * Return all marks for a set of students for a given subject + component.
   * Used by teachers to load a class's mark sheet.
   * @param {string[]} studentIds
   * @param {string}   subject
   * @param {string}   component
   * @returns {Promise<Mark[]>}
   */
  async findByStudentIdsSubjectAndComponent(studentIds, subject, component) {
    throw new Error('Not implemented');
  }
}

module.exports = IMarkRepository;
