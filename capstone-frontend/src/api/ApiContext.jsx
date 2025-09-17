import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../auth/AuthContext";

// Create the context
export const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const { token } = useAuth();

  // Read API base from Vite env (fallback to local dev)
  const BASE =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3000/api";

  // Core fetch helper
  const request = useCallback(
    async (resource, options = {}) => {
      const url = `${BASE}${resource.startsWith("/") ? "" : "/"}${resource}`;
      // temporary debug — helps when diagnosing “Failed to fetch”
      console.log("[API]", options?.method || "GET", url);

      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });

      const ct = res.headers.get("Content-Type") || "";
      const isJson = /json/i.test(ct);
      const body = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const msg =
          typeof body === "string" ? body : body?.error || res.statusText;
        throw new Error(msg);
      }
      return body;
    },
    [BASE, token]
  );

  // ---- simple tag registry so lists can refetch after mutations
  const tagsRef = useRef({}); // { [tag]: () => void }

  const provideTag = useCallback((tag, refetch) => {
    if (typeof refetch !== "function") return () => {};
    tagsRef.current[tag] = refetch;
    return () => {
      if (tagsRef.current[tag] === refetch) delete tagsRef.current[tag];
    };
  }, []);

  const invalidateTags = useCallback((tags) => {
    const arr = Array.isArray(tags) ? tags : [tags];
    arr.forEach((t) => {
      const fn = tagsRef.current[t];
      if (typeof fn === "function") {
        try {
          fn();
        } catch (e) {
          console.error("invalidateTags error for tag:", t, e);
        }
      }
    });
  }, []);

  const value = useMemo(
    () => ({ request, provideTag, invalidateTags }),
    [request, provideTag, invalidateTags]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within an ApiProvider");
  return ctx;
}
