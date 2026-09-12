const { News, Category } = require('../models');
const createSlug = require('../utils/slugify');

// GET /api/news
exports.getAll = async (req, res) => {
  try {
    const { category_id, is_published } = req.query;
    const where = {};

    if (category_id) {
      where.category_id = category_id;
    }
    if (is_published !== undefined) {
      where.is_published = is_published === 'true' || is_published === '1';
    }

    const newsList = await News.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({ success: true, data: newsList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data berita', error: error.message });
  }
};

// GET /api/news/:idOrSlug
exports.getByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = !isNaN(idOrSlug);
    const where = isNumeric ? { id: idOrSlug } : { slug: idOrSlug };

    const newsItem = await News.findOne({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    });

    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: newsItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail berita', error: error.message });
  }
};

// POST /api/news
exports.create = async (req, res) => {
  try {
    const { category_id, title, slug, content, image, is_published } = req.body;

    // Validasi input wajib
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Kategori wajib dipilih (category_id)' });
    }
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Judul berita wajib diisi' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Konten berita wajib diisi' });
    }

    // Pastikan kategori ada
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const generatedSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(title);
    const existing = await News.findOne({ where: { slug: generatedSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug berita sudah digunakan' });
    }

    const newsItem = await News.create({
      category_id: Number(category_id),
      title: title.trim(),
      slug: generatedSlug,
      content: content.trim(),
      image: image || null,
      is_published: is_published !== undefined ? Boolean(is_published) : true,
    });

    return res.status(201).json({ success: true, message: 'Berita berhasil dibuat', data: newsItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat berita', error: error.message });
  }
};

// PUT /api/news/:id
exports.update = async (req, res) => {
  try {
    const newsItem = await News.findByPk(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    const { category_id, title, slug, content, image, is_published } = req.body;

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      newsItem.category_id = Number(category_id);
    }

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Judul berita tidak boleh kosong' });
      }
      newsItem.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, message: 'Konten berita tidak boleh kosong' });
      }
      newsItem.content = content.trim();
    }

    if (slug !== undefined || title !== undefined) {
      const newSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(newsItem.title);
      if (newSlug !== newsItem.slug) {
        const existing = await News.findOne({ where: { slug: newSlug } });
        if (existing && existing.id !== newsItem.id) {
          return res.status(400).json({ success: false, message: 'Slug berita sudah digunakan' });
        }
        newsItem.slug = newSlug;
      }
    }

    if (image !== undefined) newsItem.image = image;
    if (is_published !== undefined) newsItem.is_published = Boolean(is_published);

    await newsItem.save();
    return res.status(200).json({ success: true, message: 'Berita berhasil diperbarui', data: newsItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui berita', error: error.message });
  }
};

// DELETE /api/news/:id
exports.delete = async (req, res) => {
  try {
    const newsItem = await News.findByPk(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    await newsItem.destroy();
    return res.status(200).json({ success: true, message: 'Berita berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus berita', error: error.message });
  }
};
