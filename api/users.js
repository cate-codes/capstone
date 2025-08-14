import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  createUser,
  getUserByUsernameAndPassword,
  getUserById,
} from "#db/queries/users";
import { createToken } from "#utils/jwt";

// existing / register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      const user = await createUser(username, email, password);
      const token = await createToken({ id: user.id });
      res.status(201).json({ token });
    } catch (err) {
      next(err);
    }
  }
);

// existing / login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await getUserByUsernameAndPassword(username, password);
      if (!user) return res.status(401).send("Invalid username or password.");
      const token = await createToken({ id: user.id });
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

// new : who am i
router.get("/me", requireUser, async (req, res, next) => {
  try {
    // req.user is set by getUserFromToken
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).send("User not found.");
    // never return the hashed password
    const { password, ...safe } = user;
    res.send(safe);
  } catch (err) {
    next(err);
  }
});
