import { useEffect, useState, useCallback } from "react";
import { useApi } from "../api/useApi";

// list
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

// detail
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

// moods
export function useMoods() {
  const { request, provideTag } = useApi();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request("/moods");
      setMoods(Array.isArray(res) ? res : res?.data ?? []);
      setErr(null);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
    provideTag("moods", load);
  }, [load, provideTag]);

  return { moods, loading, error, reload: load };
}
