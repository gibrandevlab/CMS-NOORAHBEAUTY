const { Category, News, Product, Vendor } = require('../models');

// GET /api/admin/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const [totalCategories, totalNews, totalProducts, totalVendors] = await Promise.all([
      Category.count(),
      News.count(),
      Product.count(),
      Vendor.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalNews,
        totalProducts,
        totalVendors,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard', error: error.message });
  }
};
