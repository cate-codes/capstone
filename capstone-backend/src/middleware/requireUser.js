import jwt from "jsonwebtoken";

/**
 * Strict auth middleware for protected routes.
 * - Expects Authorization: Bearer <JWT>
 * - (Optional) also checks req.cookies.token if cookie-parser is used
 * - On success: sets req.user from JWT payload and calls next()
 * - On failure: responds 401 JSON { error: "Missing or invalid token" }
 */
function requireUser(req, res, next) {
  try {
    // 1) Extract token
    const auth = req.headers.authorization || "";
    let token = null;

    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7).trim();
    } else if (req.cookies && req.cookies.token) {
      // optional cookie support (only if you also set cookie on login)
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    // 2) Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      // algorithms: ["HS256"], // uncomment to restrict algs
    });

    // 3) Attach user to request (shape comes from your signUser payload)
    req.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name,
    };

    return next();
  } catch (err) {
    // Distinguish common JWT errors, but don't leak details
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

export { requireUser };
export default requireUser;
