import React from "react";
import { MoodChip } from "./MoodChip";

export default function EntryCard({ entry }) {
  const date = new Date(entry.date || Date.now());
  const day = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="mt-card">
      <div className="mt-card-head">
        <MoodChip
          emoji={entry.mood_emoji ?? "🙂"}
          label={entry.mood_name ?? "Mood"}
        />
        <span className="mt-note">{day}</span>
      </div>
      <div>{entry.journal_text}</div>

      {entry.song_title || entry.song_artist ? (
        <div className="mt-song">
          <strong>🎵 {entry.song_title}</strong>
          <span className="mt-note">{entry.song_artist}</span>
        </div>
      ) : (
        <div className="mt-song mt-note">No song linked yet</div>
      )}
    </article>
  );
}
