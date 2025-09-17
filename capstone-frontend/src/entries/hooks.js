import { useEffect, useState, useCallback } from "react";
import { useApi } from "../api/useApi";

/* ----------------------------- Entries list ------------------------------ */
export function useEntries() {
  const { request, provideTag } = useApi();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request("/entries");
      setEntries(Array.isArray(res) ? res : res?.data ?? []);
      setErr(null);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
    provideTag("entries", load);
  }, [load, provideTag]);

  return { entries, loading, error, reload: load };
}

/* ----------------------------- Entry detail ------------------------------ */
export function useEntry(id) {
  const { request, provideTag } = useApi();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setErr] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await request(`/entries/${id}`);
      setEntry(res);
      setErr(null);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [id, request]);

  useEffect(() => {
    load();
    if (id) provideTag(`entry:${id}`, load);
  }, [id, load, provideTag]);

  return { entry, loading, error, reload: load };
}

/* -------------------------------- Moods ---------------------------------- */
/**
 * Fetch moods WITHOUT Authorization header (public endpoint).
 * Uses BASE from env (VITE_API_URL) or falls back to /api for the Vite proxy.
 * Normalizes each mood to { id, name, emoji } for EntryForm.
 */
export function useMoods() {
  const { provideTag } = useApi(); // we still use tagging, but NOT request()
  const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE}/moods`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.moods ?? data?.data ?? [];

      const normalized = raw.map((m) => ({
        id: m.id ?? m.mood_id,
        name: m.name ?? m.mood_name ?? "Mood",
        emoji: m.emoji ?? m.mood_emoji ?? "🙂",
      }));

      setMoods(normalized);
      setErr(null);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [BASE]);

  useEffect(() => {
    load();
    provideTag("moods", load);
  }, [load, provideTag]);

  return { moods, loading, error, reload: load };
}
