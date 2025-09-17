import React from "react";
import { Link } from "react-router-dom";
import { useEntries } from "./hooks";

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

export default function EntriesList() {
  const { entries, loading, error } = useEntries();

  if (loading) return <p>Loading…</p>;
  if (error)
    return (
      <p role="alert" className="alert">
        {String(error)}
      </p>
    );
  if (!entries?.length) return <p>No entries yet.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Entries</h1>
      <div className="entry-list">
        {entries.map((e) => (
          <Link key={e.id} to={`/entries/${e.id}`} className="entry-card">
            <div className="emoji">{e.mood_emoji || "🙂"}</div>
            <div className="body">
              <div className="date">{fmtDate(e.date)}</div>
              <div className="mood">{e.mood_name || "Mood"}</div>
              {e.song && (
                <div className="songline">
                  🎵 {e.song.name} — {e.song.artist}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
