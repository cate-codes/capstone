import express from "express";
const router = express.Router();

import { getAllMoods } from "#db/queries/moods";

router.get("/", async (req, res, next) => {
  try {
    const moods = await getAllMoods();
    res.send(moods);
  } catch (err) {
    next(err);
  }
});

export default router;
