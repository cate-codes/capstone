DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries (user_id, date DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_mood ON entries (user_id, mood_id);

CREATE TABLE IF NOT EXISTS spotify_accounts (
  user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL  -- when access_token expires
);


-- === Spotify fields for songs (safe to re-run) ===
BEGIN;

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS spotify_id  TEXT,
  ADD COLUMN IF NOT EXISTS artist      TEXT,
  ADD COLUMN IF NOT EXISTS album       TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS uri         TEXT,
  ADD COLUMN IF NOT EXISTS image_url   TEXT;

-- Unique on spotify_id so upserts work
CREATE UNIQUE INDEX IF NOT EXISTS songs_spotify_id_key ON songs (spotify_id);

-- (Optional) also keep a uniqueness guard on title+artist to avoid dupes
-- Uncomment if you want it:
-- CREATE UNIQUE INDEX IF NOT EXISTS songs_title_artist_key ON songs (title, artist);

COMMIT;
