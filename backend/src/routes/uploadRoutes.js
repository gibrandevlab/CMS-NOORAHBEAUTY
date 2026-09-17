const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../middlewares/upload');

// POST /api/admin/upload (or /api/upload)
router.post('/', uploadSingle('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
  }

  return res.status(200).json({
    success: true,
    message: 'File gambar berhasil diunggah',
    url: req.file.url,
    path: req.file.path,
    filename: req.file.filename,
    fileId: req.file.fileId || null,
  });
});

module.exports = router;
