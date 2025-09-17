import React from "react";
export function MoodChip({ emoji, label }) {
  return (
    <span className="mt-chip">
      {emoji} {label}
    </span>
  );
}
