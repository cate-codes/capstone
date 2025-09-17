import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import apiRouter from "./api/index.js";
import getUserFromToken from "./middleware/getUserFromToken.js";

const app = express();

// CORS & logging
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? /localhost/,
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || "development" })
);

// Soft auth: attach req.user if token is valid; otherwise continue
app.use(getUserFromToken);

// Mount all API routes under /api
app.use("/api", apiRouter);

// 404 for /api
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Not found", path: req.originalUrl })
);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// Start server
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
