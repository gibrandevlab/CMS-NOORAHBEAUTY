const { Category } = require('../models');
const createSlug = require('../utils/slugify');

// GET /api/categories or /api/admin/categories
exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) {
      where.type = type.toUpperCase();
    }
    const categories = await Category.findAll({ where, order: [['id', 'DESC']] });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data kategori', error: error.message });
  }
};

// GET /api/categories/:id
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail kategori', error: error.message });
  }
};

// POST /api/categories
exports.create = async (req, res) => {
  try {
    const { name, slug, type } = req.body;

    // Validasi input
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }

    const categoryType = type ? type.toUpperCase() : 'NEWS';
    if (!['NEWS', 'PRODUCT'].includes(categoryType)) {
      return res.status(400).json({ success: false, message: 'Tipe kategori harus NEWS atau PRODUCT' });
    }

    const generatedSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(name);

    // Cek keunikan slug
    const existing = await Category.findOne({ where: { slug: generatedSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug kategori sudah digunakan' });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      type: categoryType,
    });

    return res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat kategori', error: error.message });
  }
};

// PUT /api/categories/:id
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const { name, slug, type } = req.body;

    // Validasi input jika diisi
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama kategori tidak boleh kosong' });
      }
      category.name = name.trim();
    }

    if (type !== undefined) {
      const categoryType = type.toUpperCase();
      if (!['NEWS', 'PRODUCT'].includes(categoryType)) {
        return res.status(400).json({ success: false, message: 'Tipe kategori harus NEWS atau PRODUCT' });
      }
      category.type = categoryType;
    }

    if (slug !== undefined || name !== undefined) {
      const newSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(category.name);
      if (newSlug !== category.slug) {
        const existing = await Category.findOne({ where: { slug: newSlug } });
        if (existing && existing.id !== category.id) {
          return res.status(400).json({ success: false, message: 'Slug kategori sudah digunakan' });
        }
        category.slug = newSlug;
      }
    }

    await category.save();
    return res.status(200).json({ success: true, message: 'Kategori berhasil diperbarui', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui kategori', error: error.message });
  }
};

// DELETE /api/categories/:id
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await category.destroy();
    return res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus kategori', error: error.message });
  }
};
