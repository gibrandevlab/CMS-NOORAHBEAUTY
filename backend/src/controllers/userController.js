const { Op } = require('sequelize');
const { User } = require('../models');

// GET /api/admin/users
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['id', 'DESC']] });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
  }
};

// GET /api/admin/users/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail user', error: error.message });
  }
};

// POST /api/admin/users
exports.create = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ success: false, message: 'Username wajib diisi' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ success: false, message: 'Password wajib diisi' });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Cek keunikan username atau email
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: trimmedUsername },
          { email: trimmedEmail }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
      }
      if (existingUser.email === trimmedEmail) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      }
    }

    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: password.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'User admin berhasil ditambahkan',
      data: newUser.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menambah user admin', error: error.message });
  }
};

// PUT /api/admin/users/:id
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const { username, email, password } = req.body;

    if (username !== undefined) {
      if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ success: false, message: 'Username tidak boleh kosong' });
      }
      const trimmedUsername = username.trim();
      const existingUsername = await User.findOne({
        where: {
          username: trimmedUsername,
          id: { [Op.ne]: user.id }
        }
      });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh user lain' });
      }
      user.username = trimmedUsername;
    }

    if (email !== undefined) {
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ success: false, message: 'Email tidak boleh kosong' });
      }
      const trimmedEmail = email.trim().toLowerCase();
      const existingEmail = await User.findOne({
        where: {
          email: trimmedEmail,
          id: { [Op.ne]: user.id }
        }
      });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain' });
      }
      user.email = trimmedEmail;
    }

    // Ganti password jika diisi
    if (password && typeof password === 'string' && password.trim() !== '') {
      user.password = password.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User admin berhasil diperbarui',
      data: user.toJSON()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui user admin', error: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.delete = async (req, res) => {
  try {
    const userIdToDelete = Number(req.params.id);
    const currentUserId = req.user ? Number(req.user.id) : null;

    if (currentUserId && userIdToDelete === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif login'
      });
    }

    const user = await User.findByPk(userIdToDelete);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    await user.destroy();
    return res.status(200).json({ success: true, message: 'User admin berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus user admin', error: error.message });
  }
};
