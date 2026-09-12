const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const newsRoutes = require('./newsRoutes');
const vendorRoutes = require('./vendorRoutes');
const aboutUsRoutes = require('./aboutUsRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const authMiddleware = require('../middlewares/authMiddleware');

// Auth Route
router.use('/auth', authRoutes);

// Public Routes (Tanpa Auth)
router.use('/public/about', aboutUsRoutes);
router.use('/public/categories', categoryRoutes);
router.use('/public/products', productRoutes);
router.use('/public/news', newsRoutes);
router.use('/public/vendors', vendorRoutes);

// Direct CRUD Routes (Untuk Pengujian API)
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/news', newsRoutes);
router.use('/vendors', vendorRoutes);
router.use('/about', aboutUsRoutes);

// Admin Protected Routes (Menggunakan authMiddleware)
router.use('/admin/dashboard', authMiddleware, dashboardRoutes);
router.use('/admin/categories', authMiddleware, categoryRoutes);
router.use('/admin/products', authMiddleware, productRoutes);
router.use('/admin/news', authMiddleware, newsRoutes);
router.use('/admin/vendors', authMiddleware, vendorRoutes);
router.use('/admin/about', authMiddleware, aboutUsRoutes);

module.exports = router;
