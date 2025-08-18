import { createContext, useState, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

export const ApiContext = createContext(null);
export const API = import.meta.env.VITE_API_URL || "";

export function ApiProvider({ children }) {
  const { token } = useAuth();
  const BASE = API;

  const request = useCallback(
    async (resource, options = {}) => {
      const url = BASE ? `${BASE}${resource}` : resource;
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });

      const ct = res.headers.get("Content-Type") || "";
      const body = /json/i.test(ct) ? await res.json() : await res.text();
      if (!res.ok)
        throw new Error(typeof body === "string" ? body : JSON.stringify(body));
      return body;
    },
    [BASE, token]
  );

  // --- tag-based invalidation ---
  const [tags, setTags] = useState({});
  const provideTag = useCallback((tag, refetchFn) => {
    setTags((prev) => ({ ...prev, [tag]: refetchFn }));
  }, []);
  const invalidateTags = useCallback(
    (toInvalidate) => {
      toInvalidate.forEach((t) => tags[t]?.());
    },
    [tags]
  );

  const value = useMemo(
    () => ({ request, provideTag, invalidateTags }),
    [request, provideTag, invalidateTags]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
