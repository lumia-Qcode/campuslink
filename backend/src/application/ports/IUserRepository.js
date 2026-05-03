/**
 * PORT: IUserRepository
 * Outbound port — defines the contract the domain requires from storage.
 * Concrete implementations live in infrastructure/database/repositories/.
 */
class IUserRepository {
  async findByEmail(email)       { throw new Error('Not implemented'); }
  async findById(id)             { throw new Error('Not implemented'); }
  async create(userData)         { throw new Error('Not implemented'); }
  async update(id, data)         { throw new Error('Not implemented'); }
  async existsByEmail(email)     { throw new Error('Not implemented'); }
}

module.exports = IUserRepository;
