/**
 * PORT: IStudentRepository
 */
class IStudentRepository {
  async findByUserId(userId)         { throw new Error('Not implemented'); }
  async findById(id)                 { throw new Error('Not implemented'); }
  async findByStudentId(studentId)   { throw new Error('Not implemented'); }
  async create(studentData)          { throw new Error('Not implemented'); }
  async update(id, data)             { throw new Error('Not implemented'); }
}

module.exports = IStudentRepository;
