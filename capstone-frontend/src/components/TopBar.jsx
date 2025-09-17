import React from "react";
export default function TopBar({ onCreate, onSearch }) {
  return (
    <header className="mt-topbar">
      <div className="mt-topbar-inner">
        <div className="mt-logo">
          <span className="mt-badge">♪</span>
          MoodTune
        </div>

        <div className="mt-search">
          <input
            className="mt-input"
            placeholder="Search entries, moods, or songs…"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <div className="mt-actions">
          <button
            className="mt-btn"
            onClick={() => {
              const root = document.documentElement;
              const next =
                root.getAttribute("data-theme") === "light" ? "" : "light";
              if (next) root.setAttribute("data-theme", next);
              else root.removeAttribute("data-theme");
            }}
          >
            Theme
          </button>
          <button className="mt-btn mt-btn--primary" onClick={onCreate}>
            New Entry
          </button>
        </div>
      </div>
    </header>
  );
}
