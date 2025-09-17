import express from "express";
const router = express.Router();

import { searchTracks } from "#integrations/spotify";
// If you want to cache results automatically, you can import upsertSongFromSpotify

// GET /api/songs/search?q=term&limit=10
router.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    if (!q) return res.status(400).send("Missing query parameter q");
    const results = await searchTracks(q, limit);
    res.send(results);
  } catch (err) {
    next(err);
  }
});

export default router;
