const { News, Category } = require('../models');
const createSlug = require('../utils/slugify');
const { deleteFile } = require('../utils/fileHandler');

/**
 * Sanitasi HTML dasar di sisi backend untuk mencegah XSS script injection
 */
function sanitizeHtmlContent(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(["'])[\s\S]*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/href\s*=\s*(["'])javascript:[\s\S]*?\1/gi, 'href="#"');
}

/**
 * Mengekstrak semua URL gambar (/uploads/ atau CDN) dari string HTML content
 */
function extractUploadImageUrls(htmlContent) {
  if (!htmlContent) return [];
  const urls = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  return urls;
}

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
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'type'] }],
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
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'type'] }],
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
    const { category_id, title, slug, content, is_published } = req.body;

    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Kategori wajib dipilih (category_id)' });
    }
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Judul berita wajib diisi' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Konten berita wajib diisi' });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const generatedSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(title);
    const existing = await News.findOne({ where: { slug: generatedSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug berita sudah digunakan' });
    }

    const sanitizedContent = sanitizeHtmlContent(content.trim());

    let imageUrl = req.body.image || null;
    let imageFileId = req.body.image_file_id || null;

    if (req.file) {
      imageUrl = req.file.url || req.file.path;
      imageFileId = req.file.fileId || null;
    }

    const newsItem = await News.create({
      category_id: Number(category_id),
      title: title.trim(),
      slug: generatedSlug,
      content: sanitizedContent,
      image: imageUrl,
      image_file_id: imageFileId,
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

    const { category_id, title, slug, content, is_published } = req.body;

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
      newsItem.content = sanitizeHtmlContent(content.trim());
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

    // Handle Cover Image Replacement with Synchronized Deletion
    let newImageUrl = undefined;
    let newImageFileId = undefined;

    if (req.file) {
      newImageUrl = req.file.url || req.file.path;
      newImageFileId = req.file.fileId || null;
    } else if (req.body.image !== undefined) {
      newImageUrl = req.body.image;
      newImageFileId = req.body.image_file_id !== undefined ? req.body.image_file_id : null;
    }

    if (newImageUrl !== undefined && newImageUrl !== newsItem.image) {
      if (newsItem.image) {
        await deleteFile(newsItem.image, newsItem.image_file_id);
      }
      newsItem.image = newImageUrl;
      newsItem.image_file_id = newImageFileId;
    }

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

    // 1. Hapus gambar sampul utama dari storage jika ada
    if (newsItem.image) {
      await deleteFile(newsItem.image, newsItem.image_file_id);
    }

    // 2. Hapus semua gambar inline yang disisipkan di dalam HTML content
    const inlineImageUrls = extractUploadImageUrls(newsItem.content);
    for (const imgUrl of inlineImageUrls) {
      await deleteFile(imgUrl);
    }

    // 3. Hapus record dari database
    await newsItem.destroy();
    return res.status(200).json({ success: true, message: 'Berita dan file gambar terkait berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus berita', error: error.message });
  }
};
