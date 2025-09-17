import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ✅ Default to /api so the Vite proxy forwards to 3000 (no CORS headaches)
  const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

  const [token, setToken] = useState(
    () => localStorage.getItem("auth_token") || ""
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  async function login({ email, username, password }) {
    setLoading(true);
    setError("");
    try {
      const id = email ?? username;
      const body = {
        ...(id
          ? String(id).includes("@")
            ? { email: id }
            : { username: id }
          : {}),
        password,
      };

      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // read error safely whether server returns JSON or text
        let msg = "Login failed";
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch {
          msg = (await res.text()) || msg;
        }
        throw new Error(msg);
      }

      const data = await res.json(); // { token, user }
      setToken(data.token || "");
      setUser(data.user ?? null);
      return data;
    } catch (e) {
      setError(e.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, username, email, password }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (!res.ok) {
        let msg = "Registration failed";
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch {
          msg = (await res.text()) || msg;
        }
        throw new Error(msg);
      }

      const data = await res.json();
      setToken(data.token || "");
      setUser(data.user ?? null);
      return data;
    } catch (e) {
      setError(e.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  // ✅ helper that auto-attaches Bearer token and respects the proxy
  const authFetch = useMemo(() => {
    return async (input, init = {}) => {
      const headers = new Headers(init.headers || {});
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      // allow authFetch("/entries", {...})
      const url =
        typeof input === "string" && input.startsWith("/")
          ? `${API}${input}`
          : input;

      return fetch(url, { ...init, headers });
    };
  }, [API, token]);

  const value = useMemo(
    () => ({ token, user, loading, error, login, register, logout, authFetch }),
    [token, user, loading, error, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
