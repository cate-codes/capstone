import express from "express";
const router = express.Router();

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  assertPositiveInt,
  assertOptionalStringMax,
} from "#middleware/validators";
import { getMoodById } from "#db/queries/moods";
import {
  createEntry,
  getEntriesByUser,
  getEntryByIdForUser,
  updateEntryForUser,
  deleteEntryForUser,
} from "#db/queries/entries";

// Create
router.post(
  "/",
  requireUser,
  requireBody(["mood_id"]),
  async (req, res, next) => {
    try {
      const user_id = req.user.id;

      // validate ID's n body
      const mood_id = assertPositiveInt(req.body.mood_id, "mood_id");
      const song_id =
        req.body.song_id == null
          ? null
          : assertPositiveInt(req.body.song_id, "song_id");
      const journal_text = assertOptionalStringMax(
        req.body.journal_text,
        "journal_text",
        2000
      );

      // ensure the mood exists
      const mood = await getMoodById(mood_id);
      if (!mood) {
        return res.status(400).send("Invalid mood_id: mood does not exist.");
      }

      const newEntry = await createEntry({
        user_id,
        mood_id,
        song_id,
        journal_text,
      });
      res.status(201).send(newEntry);
    } catch (err) {
      next(err);
    }
  }
);

// List current user's entries
router.get("/", requireUser, async (req, res, next) => {
  try {
    const entries = await getEntriesByUser(req.user.id);
    res.send(entries);
  } catch (err) {
    next(err);
  }
});

// Get one entry (must own it)
router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const entry = await getEntryByIdForUser(Number(req.params.id), req.user.id);
    if (!entry) return res.status(404).send("Entry not found.");
    res.send(entry);
  } catch (err) {
    next(err);
  }
});

// Update (partial)
router.put("/:id", requireUser, async (req, res, next) => {
  try {
    const id = assertPositiveInt(req.params.id, "id");

    // optional fields
    let mood_id = req.body.mood_id;
    const song_id =
      req.body.song_id == null
        ? null
        : assertPositiveInt(req.body.song_id, "song_id");
    const journal_text = assertOptionalStringMax(
      req.body.journal_text,
      "journal_text",
      2000
    );

    // if mood_id is provided, validate n ensure mood exists
    if (mood_id != null) {
      mood_id = assertPositiveInt(mood_id, "mood_id");
      const mood = await getMoodById(mood_id);
      if (!mood)
        return res.status(400).send("Invalid mood_id: mood does not exist.");
    }

    const entry = await updateEntryForUser(id, req.user.id, {
      mood_id,
      song_id,
      journal_text,
    });
    if (!entry) return res.status(404).send("Entry not found or not yours.");
    res.send(entry);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete("/:id", requireUser, async (req, res, next) => {
  try {
    const id = assertPositiveInt(req.params.id, "id");
    const entry = await deleteEntryForUser(id, req.user.id);
    if (!entry) return res.status(404).send("Entry not found or not yours.");
    res.send(entry);
  } catch (err) {
    next(err);
  }
});

export default router;
