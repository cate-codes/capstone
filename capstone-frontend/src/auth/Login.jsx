import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" }); // username OR email
  const nav = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    const { identifier, password } = form;
    // Build creds the way your AuthContext expects them
    const creds = identifier.includes("@")
      ? { email: identifier, password }
      : { username: identifier, password };

    try {
      await login(creds);
      const to = location.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch {
      // AuthContext already sets `error`; no extra handling needed
    }
  }

  return (
    <div className="card">
      <h1>Log in to your account</h1>

      {error && (
        <p role="alert" className="error" aria-live="assertive">
          {String(error)}
        </p>
      )}

      <form className="stack" onSubmit={onSubmit}>
        <label>
          <span>Username or Email</span>
          <input
            value={form.identifier}
            onChange={(e) =>
              setForm((f) => ({ ...f, identifier: e.target.value }))
            }
            autoComplete="username"
            placeholder="you@example.com or yourusername"
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            autoComplete="current-password"
            placeholder="Your password"
          />
        </label>

        <button
          className="btn"
          type="submit"
          disabled={loading || !form.identifier || !form.password}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
