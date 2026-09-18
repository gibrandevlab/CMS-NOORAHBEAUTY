const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const routes = require("./routes");
const seoController = require("./controllers/seoController");

const app = express();

// Gzip Compression for all text-based API responses & static assets
app.use(compression());

const allowedOrigins = [
  "https://noorahbeauty.biz.id",
  "https://www.noorahbeauty.biz.id",
  "https://cms-noorabeauty.vercel.app",
  "https://cms-noorahbeauty.vercel.app",
  "http://localhost:8100",
  "http://localhost:8101",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Timestamp",
    "X-Signature",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files with 1-year immutable cache control headers
const staticCacheConfig = {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
};

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads"), staticCacheConfig));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), staticCacheConfig));

// SEO Directives Endpoints (Root Level)
app.get("/sitemap.xml", seoController.getSitemap);
app.get("/robots.txt", seoController.getRobots);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CMS Backend Service is Running" });
});

// Mount /api routes
app.use("/api", routes);

// 404 Handler for Unmatched Endpoints (Mencegah Soft-404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan`,
  });
});

// Central Error Handler Fallback
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

module.exports = app;