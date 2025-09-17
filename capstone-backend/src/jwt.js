import jwt from "jsonwebtoken";

export function signUser(user) {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
