import express from "express";
const router = express.Router();

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

import {
  createEntry,
  getEntriesByUserWithFilters,
  getEntryByIdForUser,
  updateEntryForUser,
  deleteEntryForUser,
  setEntrySong,
} from "#db/queries/entries";

import { upsertSongFromSpotify } from "#db/queries/songs";
import { getTrackById } from "#integrations/spotify";

// CREATE entry
router.post(
  "/",
  requireUser,
  requireBody(["mood_id"]),
  async (req, res, next) => {
    try {
      const { mood_id, journal_text, spotify_id } = req.body;
      const user_id = req.user.id;

      let song_id = null;
      if (spotify_id) {
        const track = await getTrackById(spotify_id);
        const songRow = await upsertSongFromSpotify(track);
        song_id = songRow.id;
      }

      const newEntry = await createEntry({
        user_id,
        mood_id,
        song_id,
        journal_text,
      });

      res.status(201).json(newEntry);
    } catch (err) {
      if (err.response?.data) {
        return res.status(err.response.status) || (502).send(err.response.data);
      }
      next(err);
    }
  }
);

// LIST entries (with optional filters)
router.get("/", requireUser, async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      mood_id: req.query.mood_id,
      from: req.query.from,
      to: req.query.to,
    };
    const result = await getEntriesByUserWithFilters(req.user.id, filters);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET one entry by ID
router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const entry = await getEntryByIdForUser(Number(req.params.id), req.user.id);
    if (!entry) return res.status(404).send("Entry not found.");
    res.send(entry);
  } catch (err) {
    next(err);
  }
});

// UPDATE entry
router.put("/:id", requireUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer." });
    }

    const { mood_id, song_id, journal_text } = req.body;

    const payload = {
      mood_id: mood_id === undefined ? null : mood_id,
      song_id: song_id === undefined ? null : song_id,
      journal_text: journal_text === undefined ? null : journal_text,
    };

    const entry = await updateEntryForUser(id, req.user.id, payload);
    if (!entry)
      return res.status(404).json({ error: "Entry not found or not yours." });

    res.json(entry);
  } catch (err) {
    console.error("PUT /api/entries/:id failed:", err);
    next(err);
  }
});

// DELETE entry
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const entry = await deleteEntryForUser(Number(req.params.id), req.user.id);
    if (!entry) return res.status(404).send("Entry not found or not yours.");
    res.send(entry);
  } catch (err) {
    next(err);
  }
});

// SET song on an entry via Spotify ID
router.post("/:id/song", requireUser, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).send("id must be a positive integer.");

    const { spotify_id } = req.body.spotify_id ?? req.body.spotify_track_id;
    if (!spotify_id || typeof spotify_id !== "string") {
      return res.status(400).send("Provide body with 'spotify_id' (string).");
    }

    // fetch live meta data from spotify
    const track = await getTrackById(spotify_id);

    // upsert/cached in songs table
    const songRow = await upsertSongFromSpotify(track);

    // link entry -> song
    const entry = await setEntrySong(id, req.user.id, songRow.id);
    if (!entry) return res.status(404).send("Entry not found or not yours.");

    res.send(entry);
  } catch (err) {
    if (err.response?.data) {
      return res.status(err.response.status || 502).send(err.response.data);
    }
    next(err);
  }
});

export default router;
