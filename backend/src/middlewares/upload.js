const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imagekit = require('../utils/imagekit');

// Local uploads directory (public/uploads)
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');

// 1. Storage Engines
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
    } catch (e) {
      // Ignore if filesystem is read-only (e.g. on serverless environments)
    }
    cb(null, publicUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeBaseName = path.basename(file.originalname || 'image', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}_${safeBaseName}${ext || '.png'}`;
    cb(null, uniqueFilename);
  },
});

const memoryStorage = multer.memoryStorage();

// 2. Multer Configuration (4MB Limit & Strict Image Mimetype Filter)
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB to prevent Vercel 413 Payload Too Large

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (file && allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(null, true);
  }
  const error = new Error('Tipe file tidak valid. Hanya gambar (JPEG, PNG, WEBP) yang diperbolehkan!');
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

// Create dynamic multer instance helper based on UPLOAD_DRIVER environment variable
const getMulterInstance = () => {
  const driver = (process.env.UPLOAD_DRIVER || 'local').toLowerCase();
  const storage = driver === 'cloud' ? memoryStorage : diskStorage;

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
  });
};

/**
 * Normalizes req.file object across both Local and Cloud modes.
 * Guarantees standard output properties:
 * - req.file.url : Relative URL (/uploads/file.png) or HTTPS CDN URL
 * - req.file.fileId : null (Local) or ImageKit fileId (Cloud)
 * - req.file.path : Matches req.file.url for backwards compatibility
 */
const normalizeFile = async (reqFile) => {
  if (!reqFile) return null;

  const driver = (process.env.UPLOAD_DRIVER || 'local').toLowerCase();

  if (driver === 'cloud') {
    // Upload buffer to ImageKit
    const ext = path.extname(reqFile.originalname || '').toLowerCase();
    const safeBaseName = path.basename(reqFile.originalname || 'image', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}_${safeBaseName}${ext || '.png'}`;

    const uploadResponse = await imagekit.upload({
      file: reqFile.buffer,
      fileName,
      folder: '/noorah-beauty-uploads',
    });

    reqFile.url = uploadResponse.url;
    reqFile.fileId = uploadResponse.fileId;
    reqFile.path = uploadResponse.url;
    reqFile.filename = uploadResponse.name || fileName;
  } else {
    // Local Mode Normalization
    const relativeUrl = `/uploads/${reqFile.filename}`;
    reqFile.url = relativeUrl;
    reqFile.fileId = null;
    reqFile.path = relativeUrl;
  }

  return reqFile;
};

/**
 * Single File Upload Middleware Wrapper
 * Usage: router.post('/upload', uploadSingle('image'), controller)
 */
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const multerUpload = getMulterInstance().single(fieldName);

    multerUpload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'Ukuran file terlalu besar. Maksimal 4MB!'
            : `Upload gagal: ${err.message}`;
          return res.status(400).json({ success: false, message });
        }
        return res.status(400).json({ success: false, message: err.message || 'Upload gagal.' });
      }

      if (req.file) {
        try {
          await normalizeFile(req.file);
        } catch (cloudErr) {
          console.error('[UploadMiddleware] ImageKit Upload Error:', cloudErr);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengunggah gambar ke cloud storage: ' + cloudErr.message,
          });
        }
      }

      return next();
    });
  };
};

/**
 * Array Files Upload Middleware Wrapper
 * Usage: router.post('/upload-multiple', uploadArray('images', 5), controller)
 */
const uploadArray = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const multerUpload = getMulterInstance().array(fieldName, maxCount);

    multerUpload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'Salah satu file terlalu besar. Maksimal 4MB!'
            : `Upload gagal: ${err.message}`;
          return res.status(400).json({ success: false, message });
        }
        return res.status(400).json({ success: false, message: err.message || 'Upload gagal.' });
      }

      if (req.files && Array.isArray(req.files)) {
        try {
          for (const file of req.files) {
            await normalizeFile(file);
          }
        } catch (cloudErr) {
          console.error('[UploadMiddleware] ImageKit Multiple Upload Error:', cloudErr);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengunggah salah satu gambar ke cloud storage.',
          });
        }
      }

      return next();
    });
  };
};

// Custom export compatible with both `upload.single(...)` and `uploadSingle(...)`
module.exports = {
  uploadSingle,
  uploadArray,
  single: uploadSingle,
  array: uploadArray,
  normalizeFile,
};
