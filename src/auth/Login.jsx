import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/";

  const [id, setId] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({
        email: id.includes("@") ? id : undefined,
        username: !id.includes("@") ? id : undefined,
        password,
      });
      nav(from, { replace: true });
    } catch (e) {
      const msg = String(e?.message || e || "Login failed");
      // strip any HTML that may have come back from server
      setErr(msg.replace(/<[^>]+>/g, ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Log in to your account</h1>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Username or Email</span>
            <input
              className="input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="muted">
          Need an account? <Link to="/register">Register here</Link>.
        </p>
      </div>
    </div>
  );
}
