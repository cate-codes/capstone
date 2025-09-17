import { Router } from "express";
import bcrypt from "bcrypt";
import { signUser } from "./lib/jwt.js";

const router = Router();

/**
 * In-memory users store (demo)
 * shape: { id, email, username, name, password_hash }
 */
let nextUserId = 1;
const users = [];

/* ---------------------------- POST /api/users/register ---------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { email, username, name, password } = req.body || {};
    if ((!email && !username) || !password) {
      return res
        .status(400)
        .json({ error: "email or username, and password are required" });
    }

    const exists = users.find(
      (u) =>
        (email && u.email === String(email).toLowerCase()) ||
        (username && u.username === String(username).toLowerCase())
    );
    if (exists) return res.status(409).json({ error: "User already exists" });

    const password_hash = await bcrypt.hash(String(password), 10);

    const user = {
      id: nextUserId++,
      email: (email || `${username}@example.com`).toLowerCase(),
      username:
        (username && String(username).toLowerCase()) ||
        (email ? String(email).split("@")[0].toLowerCase() : undefined),
      name: name || "User",
      password_hash,
    };
    users.push(user);

    // return a real JWT so the client is authenticated immediately
    const token = signUser(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

/* ----------------------------- POST /api/users/login ----------------------------- */
/** Accepts { username, email, identifier, password } */
router.post("/login", async (req, res) => {
  try {
    const { username, email, identifier, password } = req.body || {};
    const idRaw = identifier || username || email;
    if (!idRaw || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const id = String(idRaw).toLowerCase();

    const user =
      users.find((u) => u.username === id || u.email === id) ||
      // also allow email lookup if identifier looked like an email
      users.find((u) => (id.includes("@") ? u.email === id : false));

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash || "");
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = signUser(user);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
