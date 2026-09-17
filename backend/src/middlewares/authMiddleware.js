const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Allow OPTIONS preflight requests to pass through without token check
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};