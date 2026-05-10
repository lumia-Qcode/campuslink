/**
 * PORTS (OUT) — Repository Interfaces
 * These are contracts that adapters must implement.
 * Business logic depends only on these interfaces, never on Mongoose directly.
 */

class IUserRepository {
  async findById(id)           { throw new Error('Not implemented'); }
  async findByUsername(u)      { throw new Error('Not implemented'); }
  async create(userData)       { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
}

class IStudentRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findById(id)           { throw new Error('Not implemented'); }
  async findByStudentId(sid)   { throw new Error('Not implemented'); }
  async findByClassSection(classId, section) { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
  async count()                { throw new Error('Not implemented'); }
}

class ITeacherRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findById(id)           { throw new Error('Not implemented'); }
  async findByTeacherId(tid)   { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
  async count()                { throw new Error('Not implemented'); }
}

class ISectionRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findById(id)           { throw new Error('Not implemented'); }
  async findByClassSection(classId, section) { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
}

class IFeeRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findById(id)           { throw new Error('Not implemented'); }
  async findByStudent(studentId) { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
  async generateMonthlyFees(month, dueDate) { throw new Error('Not implemented'); }
}

class IAnnouncementRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findById(id)           { throw new Error('Not implemented'); }
  async findByRole(role)       { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
}

class ITimetableRepository {
  async findAll(filters)       { throw new Error('Not implemented'); }
  async findByClassSection(classId, section) { throw new Error('Not implemented'); }
  async findByTeacher(teacherId) { throw new Error('Not implemented'); }
  async create(data)           { throw new Error('Not implemented'); }
  async update(id, data)       { throw new Error('Not implemented'); }
  async delete(id)             { throw new Error('Not implemented'); }
  async deleteByClassSection(classId, section) { throw new Error('Not implemented'); }
}

module.exports = {
  IUserRepository,
  IStudentRepository,
  ITeacherRepository,
  ISectionRepository,
  IFeeRepository,
  IAnnouncementRepository,
  ITimetableRepository,
};
