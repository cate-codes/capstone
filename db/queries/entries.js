// db/queries/entries.js
import db from "#db/client";

// Helper: select clause that enriches an entry with mood + song fields
const ENRICH_SELECT = `
  e.id,
  e.user_id,
  e.mood_id,
  e.song_id,
  e.date,
  e.journal_text,
  m.name  AS mood_name,
  m.emoji AS mood_emoji,
  s.spotify_id AS song_spotify_id,
  s.title      AS song_title,
  s.artist     AS song_artist,
  s.album      AS song_album,
  s.preview_url,
  s.uri,
  s.image_url
`;

/** CREATE: insert a new entry, optionally with a song_id (nullable) */
export async function createEntry({
  user_id,
  mood_id,
  song_id = null,
  journal_text = null,
}) {
  const {
    rows: [row],
  } = await db.query(
    `
    WITH ins AS (
      INSERT INTO entries (user_id, mood_id, song_id, journal_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT
      ${ENRICH_SELECT}
    FROM ins e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    `,
    [user_id, mood_id, song_id, journal_text]
  );
  return row;
}

/** LIST (simple): all entries for a user, newest first */
export async function getEntriesByUser(user_id) {
  const { rows } = await db.query(
    `
    SELECT
      ${ENRICH_SELECT}
    FROM entries e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    WHERE e.user_id = $1
    ORDER BY e.date DESC, e.id DESC
    `,
    [user_id]
  );
  return rows;
}

/**
 * LIST (filtered + paginated):
 * Supports ?page, ?limit, ?mood_id, ?from (YYYY-MM-DD), ?to (YYYY-MM-DD)
 * Returns { rows, page, limit, total }
 */
export async function getEntriesByUserWithFilters(
  user_id,
  { page = 1, limit = 20, mood_id = null, from = null, to = null } = {}
) {
  // normalize inputs
  page = Number.isInteger(+page) && +page > 0 ? +page : 1;
  limit = Number.isInteger(+limit) && +limit > 0 ? Math.min(+limit, 100) : 20;
  const offset = (page - 1) * limit;

  const params = [user_id];
  const where = ["e.user_id = $1"];

  if (mood_id) {
    params.push(+mood_id);
    where.push(`e.mood_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`e.date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`e.date <= $${params.length}`);
  }

  // main page
  const pageParams = params.concat([limit, offset]);
  const { rows } = await db.query(
    `
    SELECT
      ${ENRICH_SELECT}
    FROM entries e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    WHERE ${where.join(" AND ")}
    ORDER BY e.date DESC, e.id DESC
    LIMIT $${pageParams.length - 1} OFFSET $${pageParams.length}
    `,
    pageParams
  );

  // count
  const {
    rows: [{ count }],
  } = await db.query(
    `
    SELECT COUNT(*)::int AS count
    FROM entries e
    WHERE ${where.join(" AND ")}
    `,
    params
  );

  return { rows, page, limit, total: count };
}

// GET ONE: only if owned by user
export async function getEntryByIdForUser(id, user_id) {
  const {
    rows: [row],
  } = await db.query(
    `
    SELECT
      ${ENRICH_SELECT}
    FROM entries e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    WHERE e.id = $1 AND e.user_id = $2
    `,
    [id, user_id]
  );
  return row || null;
}

/**
 * UPDATE: partial; send null explicitly to clear song_id or journal_text.
 * We coerce any undefined → null for pg param safety, then COALESCE keeps existing values.
 */
export async function updateEntryForUser(
  id,
  user_id,
  { mood_id = undefined, song_id = undefined, journal_text = undefined } = {}
) {
  const p_mood = mood_id === undefined ? null : mood_id;
  const p_song = song_id === undefined ? null : song_id;
  const p_text = journal_text === undefined ? null : journal_text;

  const {
    rows: [row],
  } = await db.query(
    `
    WITH upd AS (
      UPDATE entries
      SET
        mood_id      = COALESCE($3, mood_id),
        song_id      = $4,
        journal_text = COALESCE($5, journal_text)
      WHERE id = $1 AND user_id = $2
      RETURNING *
    )
    SELECT
      ${ENRICH_SELECT}
    FROM upd e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    `,
    [id, user_id, p_mood, p_song, p_text]
  );

  return row || null;
}

/** DELETE: only if owned by user; return deleted row (enriched) */
export async function deleteEntryForUser(id, user_id) {
  const {
    rows: [row],
  } = await db.query(
    `
    WITH del AS (
      DELETE FROM entries
      WHERE id = $1 AND user_id = $2
      RETURNING *
    )
    SELECT
      ${ENRICH_SELECT}
    FROM del e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    `,
    [id, user_id]
  );
  return row || null;
}

/** Attach/replace a song on an entry (by song_id), only if owned by user */
export async function setEntrySong(id, user_id, song_id) {
  const {
    rows: [row],
  } = await db.query(
    `
    WITH upd AS (
      UPDATE entries
      SET song_id = $3
      WHERE id = $1 AND user_id = $2
      RETURNING *
    )
    SELECT
      ${ENRICH_SELECT}
    FROM upd e
    JOIN moods m ON m.id = e.mood_id
    LEFT JOIN songs s ON s.id = e.song_id
    `,
    [id, user_id, song_id]
  );
  return row || null;
}
