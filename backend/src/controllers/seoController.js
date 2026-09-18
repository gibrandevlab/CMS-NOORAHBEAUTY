const { News, Product } = require('../models');

/**
 * Controller untuk menangani endpoint SEO (sitemap.xml & robots.txt)
 */
const getSitemap = async (req, res) => {
  try {
    const domain = process.env.SITE_URL || 'https://noorahbeauty.biz.id';
    const now = new Date().toISOString().split('T')[0];

    // Ambil data artikel berita & produk aktif dari database
    const [newsList, productList] = await Promise.all([
      News.findAll({
        where: { is_published: true },
        attributes: ['slug', 'updated_at', 'created_at'],
      }),
      Product.findAll({
        where: { is_active: true },
        attributes: ['slug', 'updated_at', 'created_at'],
      }),
    ]);

    // Format Static Pages
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Root & Static Pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/beranda', priority: '1.0', changefreq: 'daily' },
      { path: '/katalog-jasa', priority: '0.9', changefreq: 'daily' },
      { path: '/berita', priority: '0.9', changefreq: 'daily' },
    ];

    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${domain}${page.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 2. Dynamic Article Pages (/berita/:slug)
    newsList.forEach((item) => {
      const lastmodDate = item.updated_at || item.created_at || now;
      const formattedDate = new Date(lastmodDate).toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/berita/${encodeURIComponent(item.slug)}</loc>\n`;
      xml += `    <lastmod>${formattedDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // 3. Dynamic Product Pages (/katalog-jasa/:slug)
    productList.forEach((item) => {
      const lastmodDate = item.updated_at || item.created_at || now;
      const formattedDate = new Date(lastmodDate).toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${domain}/katalog-jasa/${encodeURIComponent(item.slug)}</loc>\n`;
      xml += `    <lastmod>${formattedDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).header('Content-Type', 'text/plain').send('Error generating sitemap');
  }
};

/**
 * Controller untuk menyajikan file robots.txt dinamis
 */
const getRobots = (req, res) => {
  const domain = process.env.SITE_URL || 'https://noorahbeauty.biz.id';
  const robotsText = `# Robots.txt for Noorah Beauty MUA
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /api/auth/

Sitemap: ${domain}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robotsText);
};

module.exports = {
  getSitemap,
  getRobots,
};
