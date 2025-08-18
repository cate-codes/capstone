import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../api/ApiContext.jsx";

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate on first load
  useEffect(() => {
    try {
      const t = localStorage.getItem("auth_token");
      const u = localStorage.getItem("auth_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch (err) {
      console.warn("Auth hydrate failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist token/user
  useEffect(() => {
    try {
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      else localStorage.removeItem("auth_user");
    } catch (err) {
      console.warn("Auth persist failed:", err);
    }
  }, [user]);

  // ---- API calls
  async function login({ email, username, password }) {
    const id = email ?? username;
    const body = {
      username: id && !String(id).includes("@") ? id : undefined,
      email: id && String(id).includes("@") ? id : undefined,
      password,
    };

    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const ct = res.headers.get("Content-Type") || "";
    const data = /json/i.test(ct) ? await res.json() : await res.text();
    if (!res.ok)
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));

    const payload = data?.data || data;
    if (payload?.token) setToken(payload.token);
    if (payload?.user) setUser(payload.user);
    return payload;
  }

  async function register({ email, username, name, password }) {
    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, name, password }),
    });
    const ct = res.headers.get("Content-Type") || "";
    const data = /json/i.test(ct) ? await res.json() : await res.text();
    if (!res.ok)
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    return data?.data || data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      setToken,
      setUser,
      login,
      register,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
