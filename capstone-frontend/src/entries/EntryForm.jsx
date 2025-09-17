import React from "react";
import { useEffect, useState } from "react";
import SongPicker from "../songs/SongPicker";

export default function EntryForm({
  moods = [],
  initial = null,
  submitLabel = "Save",
  onSubmit,
}) {
  const [moodId, setMoodId] = useState(initial?.mood_id ?? "");
  const [text, setText] = useState(initial?.journal_text ?? "");
  const [song, setSong] = useState(initial?.song ?? null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // keep form in sync if the parent provides a different "initial"
  useEffect(() => {
    setMoodId(initial?.mood_id ?? "");
    setText(initial?.journal_text ?? "");
    setSong(initial?.song ?? null);
  }, [initial]);

  const selectedMood =
    moods.find((m) => String(m.id) === String(moodId)) || null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!moodId) {
      setErr("Please choose a mood.");
      return;
    }

    setBusy(true);
    try {
      await onSubmit({
        mood_id: Number(moodId),
        journal_text: text,
        song: song
          ? {
              id: song.id,
              name: song.name,
              artist: song.artist,
              album: song.album ?? null,
              artwork: song.artwork ?? null,
              previewUrl: song.previewUrl ?? null,
              url: song.url ?? null,
            }
          : null,
      });
    } catch (e) {
      setErr(e?.message || "Failed to save your entry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      {err && <div className="alert">{err}</div>}

      {/* fun: big emoji that bumps when mood changes */}
      {selectedMood && (
        <div className="mood-preview" key={selectedMood.id}>
          <span className="mood-bounce" style={{ fontSize: 42 }}>
            {selectedMood.emoji}
          </span>
        </div>
      )}

      <label>
        <span>Mood</span>
        <select
          className="input"
          value={moodId}
          onChange={(e) => setMoodId(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a mood…
          </option>
          {moods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji ? `${m.emoji} ` : ""} {m.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Journal</span>
        <textarea
          className="input"
          rows={6}
          placeholder="How are you feeling today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      {/* song search + select (optional) */}
      <SongPicker value={song} onChange={setSong} />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
