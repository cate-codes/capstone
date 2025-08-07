import express from "express";
const router = express.Router();

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import { createEntry } from "#db/queries/entries";

router.post(
  "/",
  requireUser,
  requireBody(["mood_id"]),
  async (req, res, next) => {
    try {
      const { mood_id, song_id, journal_text } = req.body;
      const user_id = req.user.id;

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

export default router;
