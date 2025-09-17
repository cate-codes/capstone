// api/index.js
import { Router } from "express";
import usersRouter from "./users.js";
import entriesRouter from "./entries.js";
import moodsRouter from "./moods.js";
import songsRouter from "./songs.js";
import { requireUser } from "../middleware/requireUser.js";

const router = Router();

router.use("/users", usersRouter); //public
router.use("/moods", moodsRouter); //public
router.use("/songs", songsRouter); //public

router.use("/entries", requireUser, entriesRouter); // protected

router.get("/health", (_req, res) =>
  res.json({ ok: true, uptime: process.uptime() })
);

export default router;
