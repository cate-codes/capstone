import jwt from "jsonwebtoken";

export function requireUser(req, res, next) {
  // if getUserFromToken already set req.user, we’re good
  if (req.user?.id) return next();

  // otherwise, allow direct strict check too
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
    };
    return next();
  } catch (e) {
    if (e?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

export default requireUser;
