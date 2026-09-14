const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createSlug = require('../utils/slugify');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const rawSlug = req.body.slug || req.query.slug || 'berita';
    const cleanSlug = createSlug(rawSlug) || 'berita';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';

    // Cari file yang sudah ada dengan pola slug#*
    try {
      const existingFiles = fs.readdirSync(uploadsDir).filter((filename) => {
        return filename.startsWith(`${cleanSlug}#`);
      });

      let maxIndex = 0;
      const regex = new RegExp(`^${cleanSlug}#(\\d+)\\.`, 'i');
      existingFiles.forEach((f) => {
        const match = f.match(regex);
        if (match && match[1]) {
          const idx = parseInt(match[1], 10);
          if (idx > maxIndex) maxIndex = idx;
        }
      });

      const nextIndex = maxIndex + 1;
      const newFilename = `${cleanSlug}#${nextIndex}${ext}`;
      cb(null, newFilename);
    } catch (err) {
      const fallbackName = `${cleanSlug}#${Date.now()}${ext}`;
      cb(null, fallbackName);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (jpg, png, gif, webp, svg) yang diizinkan!'));
  },
});

// POST /api/admin/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    message: 'File gambar berhasil diunggah',
    url: fileUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
