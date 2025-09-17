// app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import entriesRouter from "#api/entries";
import usersRouter from "#api/users";
import moodsRouter from "#api/moods";
import songsRouter from "#api/songs";

import getUserFromToken from "#middleware/getUserFromToken"; // soft auth (no throw)
import handlePostgresErrors from "#middleware/handlePostgresErrors";
import { requireUser } from "#middleware/requireUser";

const app = express();

// Core middleware
app.use(cors({ origin: process.env.CORS_ORIGIN ?? /localhost/ }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- PUBLIC ROUTES ---
app.use("/api/users", usersRouter); // /api/users/register, /api/users/login
app.use("/api/moods", moodsRouter); // GET /api/moods
app.use("/api/songs", songsRouter); // spotify helpers

// Attach req.user if a valid token is present (do NOT error on invalid)
app.use(getUserFromToken);

// --- PROTECTED ROUTES ---
app.use("/api/entries", requireUser, entriesRouter);

// 404 for /api
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Error handling (must come last)
app.use(handlePostgresErrors);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

export default app;
