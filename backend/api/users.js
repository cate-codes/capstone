import { Router } from "express";
const router = Router();

// ---- In-memory "DB" for class demo
let nextUserId = 1;
const users = []; // { id, email, username, name, password }

// POST /api/users/register
router.post("/register", (req, res) => {
  const { email, username, name, password } = req.body || {};
  if ((!email && !username) || !password) {
    return res
      .status(400)
      .json({ error: "email or username, and password are required" });
  }
  const exists = users.find(
    (u) => (email && u.email === email) || (username && u.username === username)
  );
  if (exists) return res.status(409).json({ error: "User already exists" });

  const user = {
    id: nextUserId++,
    email: email || `${username}@example.com`,
    username: username || (email ? email.split("@")[0] : undefined),
    name: name || "User",
    password, // plain text for demo; replace with bcrypt in real apps
  };
  users.push(user);

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
});

// POST /api/users/login  (accepts username OR email)
router.post("/login", (req, res) => {
  const { username, email, identifier, password } = req.body || {};
  const id = identifier || username || email;
  if (!id || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const user = users.find((u) => u.username === id || u.email === id);
  if (!user) {
    // For demo: if no user exists yet, allow login so UI works
    return res.json({
      token: "dev-token",
      user: {
        id: 0,
        email: id.includes("@") ? id : `${id}@example.com`,
        username: id.includes("@") ? id.split("@")[0] : id,
        name: "Demo User",
      },
    });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  return res.json({
    token: `demo-token-${user.id}`,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  });
});

export default router;
