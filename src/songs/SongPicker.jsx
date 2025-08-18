import { useEffect, useRef, useState } from "react";

export default function SongPicker({ value, onChange }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [err, setErr] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setErr(null);
      return;
    }

    const handle = setTimeout(async () => {
      // cancel any in-flight request
      try {
        abortRef.current?.abort();
      } catch (e) {
        /* ignore already-aborted */ console.debug(e);
      }
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setErr(null);
      try {
        // Call iTunes directly (supports CORS)
        const url =
          "https://itunes.apple.com/search?" +
          new URLSearchParams({
            media: "music",
            entity: "song",
            limit: "10",
            term: term,
          });

        const r = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(`iTunes ${r.status}`);
        const data = await r.json();

        const mapped = (data.results || []).map((x) => ({
          id: String(x.trackId),
          name: x.trackName,
          artist: x.artistName,
          album: x.collectionName,
          artwork: x.artworkUrl100 || x.artworkUrl60 || null,
          previewUrl: x.previewUrl || null,
          url: x.trackViewUrl || x.collectionViewUrl || null,
        }));

        setResults(mapped);
      } catch (e) {
        if (e.name !== "AbortError") {
          setErr(e.message || "Search failed");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
      try {
        abortRef.current?.abort();
      } catch (e) {
        if (import.meta.env.DEV) console.debug("abort ignore:", e);
      }
    };
  }, [q]);

  const selected = value || null;

  return (
    <div className="stack">
      <label>
        <span>Song (optional)</span>
        <input
          className="input"
          placeholder="Search songs (title or artist)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {err && <div className="alert">{err}</div>}

      {/* Selected song */}
      {selected && (
        <div className="song-card">
          {selected.artwork && <img src={selected.artwork} alt="" />}
          <div className="song-meta">
            <div className="song-title">{selected.name}</div>
            <div className="song-sub">
              {selected.artist}
              {selected.album ? ` • ${selected.album}` : ""}
            </div>
            <div className="song-actions">
              {selected.previewUrl && (
                <audio controls src={selected.previewUrl} />
              )}
              {selected.url && (
                <a
                  className="btn"
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => onChange(null)}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results (only when nothing selected) */}
      {!selected && (
        <>
          {loading && <p className="muted">Searching…</p>}
          {!loading && !!results.length && (
            <div className="song-results">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="song-result"
                  onClick={() => {
                    onChange(r);
                    setQ("");
                    setResults([]);
                  }}
                >
                  {r.artwork && <img src={r.artwork} alt="" />}
                  <div className="song-meta">
                    <div className="song-title">{r.name}</div>
                    <div className="song-sub">
                      {r.artist}
                      {r.album ? ` • ${r.album}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!loading && !err && q.trim() && results.length === 0 && (
            <p className="muted">No results.</p>
          )}
        </>
      )}
    </div>
  );
}
