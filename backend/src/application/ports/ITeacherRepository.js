/**
 * PORT: ITeacherRepository
 * Defines the contract the application layer uses to read/write teacher data.
 * Concrete adapters (Mongo, in-memory, etc.) implement this interface.
 */
class ITeacherRepository {
  /** Find teacher profile by linked User ObjectId */
  async findByUserId(userId)      { throw new Error('Not implemented'); }

  /** Find teacher profile by internal _id */
  async findById(id)              { throw new Error('Not implemented'); }

  /** Find teacher profile by teacherId string (e.g. "T-001") */
  async findByTeacherId(tid)      { throw new Error('Not implemented'); }

  /** Persist a new teacher profile */
  async create(data)              { throw new Error('Not implemented'); }

  /** Update an existing teacher profile */
  async update(id, data)          { throw new Error('Not implemented'); }
}

module.exports = ITeacherRepository;
