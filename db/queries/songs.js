// db/queries/songs.js
import db from "#db/client";

/** Get a song by spotify_id if we already cached it */
export async function getSongBySpotifyId(spotify_id) {
  const {
    rows: [song],
  } = await db.query(`SELECT * FROM songs WHERE spotify_id = $1`, [spotify_id]);
  return song || null;
}

/** Upsert a Spotify track into songs table; return the row */
export async function upsertSongFromSpotify(track) {
  const { spotify_id, title, artist, album, preview_url, uri, image_url } =
    track;

  const {
    rows: [song],
  } = await db.query(
    `
    INSERT INTO songs (spotify_id, title, artist, album, preview_url, uri, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (spotify_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      artist = EXCLUDED.artist,
      album = EXCLUDED.album,
      preview_url = EXCLUDED.preview_url,
      uri = EXCLUDED.uri,
      image_url = EXCLUDED.image_url
    RETURNING *
    `,
    [spotify_id, title, artist, album, preview_url, uri, image_url]
  );

  return song;
}
