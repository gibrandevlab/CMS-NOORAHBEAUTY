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

    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext || ext === '.') {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/gif') ext = '.gif';
      else if (file.mimetype === 'image/svg+xml') ext = '.svg';
      else ext = '.jpg';
    }

    try {
      // Gunakan pemisah '_' agar URL valid dan tidak terpotong hash anchor '#' di browser
      const existingFiles = fs.readdirSync(uploadsDir).filter((filename) => {
        return filename.startsWith(`${cleanSlug}_`) || filename.startsWith(`${cleanSlug}#`);
      });

      let maxIndex = 0;
      const regex = new RegExp(`^${cleanSlug}[_#](\\d+)\\.`, 'i');
      existingFiles.forEach((f) => {
        const match = f.match(regex);
        if (match && match[1]) {
          const idx = parseInt(match[1], 10);
          if (idx > maxIndex) maxIndex = idx;
        }
      });

      const nextIndex = maxIndex + 1;
      const newFilename = `${cleanSlug}_${nextIndex}${ext}`;
      cb(null, newFilename);
    } catch (err) {
      const fallbackName = `${cleanSlug}_${Date.now()}${ext}`;
      cb(null, fallbackName);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream');
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', ''];

    if (isImageMime || allowedExts.includes(ext)) {
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

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Gambar terlalu besar. Maksimal ukuran file adalah 10MB.'
      : `Upload gambar gagal: ${err.message}`;
    return res.status(400).json({ success: false, message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Upload gambar gagal.' });
  }

  return next();
});

module.exports = router;
