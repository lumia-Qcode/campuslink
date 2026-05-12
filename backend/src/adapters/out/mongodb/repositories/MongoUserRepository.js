const UserModel = require('../models/UserModel');
const { IUserRepository } = require('../../../../ports/out/repositories');

class MongoUserRepository extends IUserRepository {
  async findById(id) {
    return UserModel.findById(id).lean();
  }

  async findByUsername(username) {
    return UserModel.findOne({ username: username.toLowerCase() });
  }

  async create(data) {
    const user = new UserModel(data);
    return user.save();
  }

  async update(id, data) {
    return UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id);
  }
}

module.exports = MongoUserRepository;
