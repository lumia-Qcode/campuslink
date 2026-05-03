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
}

module.exports = IMarkRepository;
