/**
 * Middleware untuk SEO Caching Header dan Bot Detection Helper
 */
const cacheControlPublic = (maxAgeSeconds = 300, sMaxAgeSeconds = 600) => {
  return (req, res, next) => {
    // Hanya berikan Cache-Control publik pada method GET
    if (req.method === 'GET') {
      res.setHeader(
        'Cache-Control',
        `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=60`
      );
    }
    next();
  };
};

/**
 * Middleware pendeteksi crawler / social media bot (WhatsApp, Facebook, Twitter, Googlebot)
 */
const isBotRequest = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const botPattern = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyouhave|outbrain|pinterest\/bot|slackbot|vkShare|W3C_Validator|whatsapp/i;
  return botPattern.test(userAgent);
};

module.exports = {
  cacheControlPublic,
  isBotRequest,
};
