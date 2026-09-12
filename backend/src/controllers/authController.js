const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || username.trim() === '') {
      return res.status(400).json({ success: false, message: 'Username wajib diisi' });
    }
    if (!password || password.trim() === '') {
      return res.status(400).json({ success: false, message: 'Password wajib diisi' });
    }

    // Cari user dengan scope withPassword
    const user = await User.scope('withPassword').findOne({
      where: { username: username.trim() },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const userObj = user.toJSON();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login', error: error.message });
  }
};
