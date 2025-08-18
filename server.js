// server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

import usersRouter from "./api/users.js"; // /api/users/login, /api/users/register
// If you have entries/moods, import and mount their router too:
import dataRouter from "./api/entries.js";

const app = express();

// --- CORS (Express 5 safe) ---
const allowed = new Set(["http://localhost:5173", "http://localhost:5174"]);
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin (no origin header) and Vite dev origins
      cb(null, !origin || allowed.has(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- core middleware BEFORE routes ---
app.use(express.json());
app.use(morgan("dev"));

// --- routes ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/users", usersRouter); // -> POST /api/users/login, /api/users/register
app.use("/api", dataRouter); // -> your entries/moods if you have them

// 404 + error handlers
app.use((req, res) =>
  res.status(404).json({ error: "Not found", path: req.originalUrl })
);
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
