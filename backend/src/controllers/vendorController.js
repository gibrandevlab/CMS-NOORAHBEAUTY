const { Vendor } = require('../models');

// GET /api/vendors
exports.getAll = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({ order: [['id', 'DESC']] });
    return res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data vendor', error: error.message });
  }
};

// GET /api/vendors/:id
exports.getById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail vendor', error: error.message });
  }
};

// POST /api/vendors
exports.create = async (req, res) => {
  try {
    const { name, logo, address, contact } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama vendor wajib diisi' });
    }

    const vendor = await Vendor.create({
      name: name.trim(),
      logo: logo || null,
      address: address || null,
      contact: contact || null,
    });

    return res.status(201).json({ success: true, message: 'Vendor berhasil dibuat', data: vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat vendor', error: error.message });
  }
};

// PUT /api/vendors/:id
exports.update = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan' });
    }

    const { name, logo, address, contact } = req.body;

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama vendor tidak boleh kosong' });
      }
      vendor.name = name.trim();
    }

    if (logo !== undefined) vendor.logo = logo;
    if (address !== undefined) vendor.address = address;
    if (contact !== undefined) vendor.contact = contact;

    await vendor.save();
    return res.status(200).json({ success: true, message: 'Vendor berhasil diperbarui', data: vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui vendor', error: error.message });
  }
};

// DELETE /api/vendors/:id
exports.delete = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor tidak ditemukan' });
    }

    await vendor.destroy();
    return res.status(200).json({ success: true, message: 'Vendor berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus vendor', error: error.message });
  }
};
