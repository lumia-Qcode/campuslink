class AuthController {
  constructor(authUseCases) {
    this.authUseCases = authUseCases;
  }

  login = async (req, res, next) => {
    try {
      let { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }
      // Type-check: prevent passing objects/arrays as credentials
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid credentials format' });
      }
      // Limit length to prevent DoS / regex bombs
      username = username.trim().slice(0, 128);
      password = password.slice(0, 256);

      const result = await this.authUseCases.login(username, password);
      res.json({ success: true, ...result });
    } catch (err) {
      if (err.message.includes('Invalid')) {
        return res.status(401).json({ success: false, message: err.message });
      }
      next(err);
    }
  };

  me = async (req, res) => {
    res.json({ success: true, user: req.user });
  };
}

module.exports = AuthController;