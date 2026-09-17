const { Product, Category } = require('../models');
const createSlug = require('../utils/slugify');
const { deleteFile } = require('../utils/fileHandler');

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { category_id, is_active } = req.query;
    const where = {};

    if (category_id) {
      where.category_id = category_id;
    }
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === '1';
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'type'] }],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data produk', error: error.message });
  }
};

// GET /api/products/:idOrSlug
exports.getByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = !isNaN(idOrSlug);
    const where = isNumeric ? { id: idOrSlug } : { slug: idOrSlug };

    const product = await Product.findOne({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'type'] }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail produk', error: error.message });
  }
};

// POST /api/products
exports.create = async (req, res) => {
  try {
    const { category_id, name, slug, description, price, is_active } = req.body;

    // Validasi input wajib
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'Kategori wajib dipilih (category_id)' });
    }
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
    }

    // Pastikan kategori ada
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const generatedSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(name);
    const existing = await Product.findOne({ where: { slug: generatedSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug produk sudah digunakan' });
    }

    const numPrice = price !== undefined ? Number(price) : 0;
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Harga produk harus berupa angka tidak negatif' });
    }

    // Resolve Image URL & ImageKit File ID (handles both req.file multipart and req.body string input)
    let imageUrl = req.body.image || null;
    let imageFileId = req.body.image_file_id || null;

    if (req.file) {
      imageUrl = req.file.url || req.file.path;
      imageFileId = req.file.fileId || null;
    }

    const product = await Product.create({
      category_id: Number(category_id),
      name: name.trim(),
      slug: generatedSlug,
      description: description || null,
      price: numPrice,
      image: imageUrl,
      image_file_id: imageFileId,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    return res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat produk', error: error.message });
  }
};

// PUT /api/products/:id
exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const { category_id, name, slug, description, price, is_active } = req.body;

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      product.category_id = Number(category_id);
    }

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama produk tidak boleh kosong' });
      }
      product.name = name.trim();
    }

    if (slug !== undefined || name !== undefined) {
      const newSlug = slug && slug.trim() !== '' ? createSlug(slug) : createSlug(product.name);
      if (newSlug !== product.slug) {
        const existing = await Product.findOne({ where: { slug: newSlug } });
        if (existing && existing.id !== product.id) {
          return res.status(400).json({ success: false, message: 'Slug produk sudah digunakan' });
        }
        product.slug = newSlug;
      }
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ success: false, message: 'Harga produk harus berupa angka tidak negatif' });
      }
      product.price = numPrice;
    }

    // Handle Image Replacement with Synchronized Deletion
    let newImageUrl = undefined;
    let newImageFileId = undefined;

    if (req.file) {
      newImageUrl = req.file.url || req.file.path;
      newImageFileId = req.file.fileId || null;
    } else if (req.body.image !== undefined) {
      newImageUrl = req.body.image;
      newImageFileId = req.body.image_file_id !== undefined ? req.body.image_file_id : null;
    }

    if (newImageUrl !== undefined && newImageUrl !== product.image) {
      // Safely delete old image file from storage (local or ImageKit) before updating
      if (product.image) {
        await deleteFile(product.image, product.image_file_id);
      }
      product.image = newImageUrl;
      product.image_file_id = newImageFileId;
    }

    if (is_active !== undefined) product.is_active = Boolean(is_active);

    await product.save();
    return res.status(200).json({ success: true, message: 'Produk berhasil diperbarui', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui produk', error: error.message });
  }
};

// DELETE /api/products/:id
exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Synchronized Deletion: Delete file from storage (Local / ImageKit CDN) non-blockingly
    if (product.image) {
      await deleteFile(product.image, product.image_file_id);
    }

    // Delete database record
    await product.destroy();
    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus produk', error: error.message });
  }
};
