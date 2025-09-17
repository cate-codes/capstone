// src/api/useApi.jsx
import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

export function useApi() {
  const { token } = useAuth();
  const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

  return useMemo(() => {
    // Endpoints that should NOT send Authorization
    const publicPaths = [
      /^\/moods\b/i,
      /^\/users\/login\b/i,
      /^\/users\/register\b/i,
      /^\/health\b/i,
      /^\/songs\b/i,
    ];

    async function request(path, opts = {}) {
      const { method = "GET", headers = {}, body, noAuth } = opts;

      const url = /^https?:\/\//i.test(path)
        ? path
        : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

      const h = new Headers(headers);
      if (!h.has("Content-Type")) h.set("Content-Type", "application/json");

      const skipAuth = noAuth || publicPaths.some((rx) => rx.test(path));
      if (token && !skipAuth) h.set("Authorization", `Bearer ${token}`);

      const res = await fetch(url, {
        method,
        headers: h,
        body:
          body == null || typeof body === "string"
            ? body
            : JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          (typeof data === "string" ? data : `HTTP ${res.status}`);
        throw new Error(msg);
      }
      return data;
    }

    // simple tag cache to trigger reloads
    const listeners = new Map(); // Map<string, () => void>

    function provideTag(tag, reload) {
      listeners.set(tag, reload);
      return () => listeners.delete(tag);
    }

    function invalidate(tags) {
      const list = Array.isArray(tags) ? tags : [tags];
      list.forEach((t) => {
        const fn = listeners.get(t);
        if (typeof fn === "function") fn();
      });
    }

    return { request, provideTag, invalidate };
  }, [BASE, token]);
}

export default useApi;
