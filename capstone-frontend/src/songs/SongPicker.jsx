import React, { useEffect, useRef, useState } from "react";
import { useApi } from "../api/useApi";

export default function SongPicker({ value, onChange }) {
  const { request } = useApi();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [closed, setClosed] = useState(false); // <- close suggestions after select
  const audioRef = useRef(null);

  // Debounced search (default to iTunes so we usually get previewUrl)
  useEffect(() => {
    if (closed) {
      setResults([]);
      return;
    } // keep closed until user types
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }

    let ignore = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const url = `/songs/search?src=itunes&q=${encodeURIComponent(q)}`;
        const data = await request(url, { noAuth: true });
        if (!ignore) setResults(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setResults([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [q, closed, request]);

  function handleSelect(track) {
    onChange(track);
    setQ(`${track.name} — ${track.artist}`); // keep text visible
    setResults([]);
    setClosed(true); // prevent auto-reopen
  }

  function togglePreview(track, e) {
    e?.stopPropagation(); // don't trigger selection when clicking play
    if (!track.previewUrl) return;
    const audio = audioRef.current || (audioRef.current = new Audio());
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = track.previewUrl;
    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        setPlayingId(track.id);
        audio.onended = () => setPlayingId(null);
      })
      .catch(() => setPlayingId(null));
  }

  // cleanup on unmount
  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
    },
    []
  );

  return (
    <div className="song-picker">
      <label>
        <span>Song (optional)</span>
        <input
          className="input"
          placeholder="Search songs (title or artist)…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setClosed(false);
          }} // typing re-opens
        />
      </label>

      {/* Selected song preview */}
      {value && (
        <div className="song-item" style={{ marginTop: 8 }}>
          <img className="cover" src={value.artwork || ""} alt="" />
          <div className="meta">
            <div className="title">{value.name}</div>
            <div className="artist">{value.artist}</div>
          </div>
          {value.previewUrl && (
            <audio src={value.previewUrl} controls style={{ height: 32 }} />
          )}
          <button type="button" className="btn" onClick={() => onChange(null)}>
            Clear
          </button>
          {value.url && (
            <a
              className="btn"
              href={value.url}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          )}
        </div>
      )}

      {/* Results (stacked rectangles) */}
      {!!results.length && (
        <div className="song-results">
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              className="song-item"
              onClick={() => handleSelect(s)} // select anywhere on the row
            >
              <img className="cover" src={s.artwork || ""} alt="" />
              <div className="meta">
                <div className="title">{s.name}</div>
                <div className="artist">
                  {s.artist}
                  {s.album ? ` • ${s.album}` : ""}
                </div>
              </div>
              <div className="song-actions" style={{ marginLeft: "auto" }}>
                {s.previewUrl ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={(e) => togglePreview(s, e)} // don't select when play/pause
                    title={
                      playingId === s.id ? "Pause preview" : "Play preview"
                    }
                  >
                    {playingId === s.id ? "⏸︎" : "▶︎"}
                  </button>
                ) : (
                  <span className="mt-note">No preview</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-note" style={{ marginTop: 8 }}>
          Searching…
        </div>
      )}
    </div>
  );
}
