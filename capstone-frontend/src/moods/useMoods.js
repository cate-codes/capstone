import { useEffect, useState } from "react";

export function useMoods() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // ✅ plain fetch to avoid sending Authorization
        const res = await fetch("/api/moods", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const data = await res.json();

        // Accept either [{...}] or { moods: [{...}] }
        const raw = Array.isArray(data) ? data : data?.moods ?? [];

        // Normalize fields to what EntryForm expects (id, name, emoji)
        const normalized = raw.map((m) => ({
          id: m.id ?? m.mood_id,
          name: m.name ?? m.mood_name ?? "Mood",
          emoji: m.emoji ?? m.mood_emoji ?? "🙂",
        }));

        if (alive) setMoods(normalized);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load moods");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { moods, loading, error };
}
