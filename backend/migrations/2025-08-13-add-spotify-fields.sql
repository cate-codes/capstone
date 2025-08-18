-- migrations/2025-08-13-add-spotify-fields.sql
BEGIN;

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS spotify_id  TEXT,
  ADD COLUMN IF NOT EXISTS artist      TEXT,
  ADD COLUMN IF NOT EXISTS album       TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS uri         TEXT,
  ADD COLUMN IF NOT EXISTS image_url   TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS songs_spotify_id_key
  ON songs (spotify_id);

COMMIT;
