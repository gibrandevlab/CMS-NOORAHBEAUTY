const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

const allowedOrigins = [
  "https://noorahbeauty.biz.id",
  "https://www.noorahbeauty.biz.id",
  "https://cms-noorabeauty.vercel.app",
  "https://cms-noorahbeauty.vercel.app",
  "http://localhost:8100",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
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
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from public/uploads and legacy uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CMS Backend Service is Running" });
});

// Mount /api routes
app.use("/api", routes);

// Central error handler fallback
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

module.exports = app;