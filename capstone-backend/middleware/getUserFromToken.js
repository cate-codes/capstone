import jwt from "jsonwebtoken";

export default function getUserFromToken(req, _res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
    };
  } catch {
    // swallow invalid tokens so public routes still work
  }
  return next();
}
