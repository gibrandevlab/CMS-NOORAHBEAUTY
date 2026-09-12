const { AboutUs } = require('../models');

// GET /api/about-us
exports.get = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      aboutUs = await AboutUs.create({
        company_name: 'PT Gibran',
        description: 'Profil perusahaan belum diisi.',
      });
    }
    return res.status(200).json({ success: true, data: aboutUs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil profil perusahaan', error: error.message });
  }
};

// PUT /api/about-us
exports.update = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      aboutUs = await AboutUs.create({ company_name: 'PT Gibran' });
    }

    const { company_name, description, vision, mission, address, phone, email } = req.body;

    if (company_name !== undefined) {
      if (!company_name || company_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nama perusahaan tidak boleh kosong' });
      }
      aboutUs.company_name = company_name.trim();
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Format email tidak valid' });
      }
      aboutUs.email = email;
    }

    if (description !== undefined) aboutUs.description = description;
    if (vision !== undefined) aboutUs.vision = vision;
    if (mission !== undefined) aboutUs.mission = mission;
    if (address !== undefined) aboutUs.address = address;
    if (phone !== undefined) aboutUs.phone = phone;

    await aboutUs.save();
    return res.status(200).json({ success: true, message: 'Profil perusahaan berhasil diperbarui', data: aboutUs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil perusahaan', error: error.message });
  }
};
