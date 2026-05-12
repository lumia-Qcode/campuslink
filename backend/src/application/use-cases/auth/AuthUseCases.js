const jwt = require('jsonwebtoken');


class AuthUseCases {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const userDoc = await this.userRepository.findByUsername(username.toLowerCase().trim());
    if (!userDoc) {
      throw new Error('Invalid username or password');
    }

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    const payload = {
      id:       userDoc._id,
      username: userDoc.username,
      role:     userDoc.role,
      name:     userDoc.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
      token,
      user: {
        id:       userDoc._id,
        username: userDoc.username,
        role:     userDoc.role,
        name:     userDoc.name,
      },
    };
  }
}

module.exports = AuthUseCases;
