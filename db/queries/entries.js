import db from "#db/client";

/**
 * Create a new entry and return it with mood details.
 */
export async function createEntry({
  user_id,
  mood_id,
  song_id = null,
  journal_text,
}) {
  const {
    rows: [entry],
  } = await db.query(
    `
    WITH ins AS (
      INSERT INTO entries (user_id, mood_id, song_id, journal_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT 
      ins.*,
      m.name  AS mood_name,
      m.emoji AS mood_emoji
    FROM ins
    JOIN moods m ON m.id = ins.mood_id
    `,
    [user_id, mood_id, song_id, journal_text]
  );
  return entry;
}

/**
 * List the current user's entries (newest first) with mood details.
 */
export async function getEntriesByUser(user_id) {
  const { rows } = await db.query(
    `
    SELECT 
      e.*,
      m.name  AS mood_name,
      m.emoji AS mood_emoji
    FROM entries e
    JOIN moods m ON m.id = e.mood_id
    WHERE e.user_id = $1
    ORDER BY e.date DESC, e.id DESC
    `,
    [user_id]
  );
  return rows;
}

/**
 * Get a single entry (must belong to user) with mood details.
 */
export async function getEntryByIdForUser(id, user_id) {
  const {
    rows: [entry],
  } = await db.query(
    `
    SELECT 
      e.*,
      m.name  AS mood_name,
      m.emoji AS mood_emoji
    FROM entries e
    JOIN moods m ON m.id = e.mood_id
    WHERE e.id = $1 AND e.user_id = $2
    `,
    [id, user_id]
  );
  return entry || null;
}

/**
 * Update an entry (only owner). Supports partial updates.
 * Returns the updated entry with mood details.
 */
export async function updateEntryForUser(
  id,
  user_id,
  { mood_id, song_id = null, journal_text }
) {
  const {
    rows: [entry],
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
      upd.*,
      m.name  AS mood_name,
      m.emoji AS mood_emoji
    FROM upd
    JOIN moods m ON m.id = upd.mood_id
    `,
    [id, user_id, mood_id ?? null, song_id, journal_text ?? null]
  );
  return entry || null;
}

/**
 * Delete an entry (only owner).
 * Returns the deleted entry with mood details (useful for UI undo/snackbar).
 */
export async function deleteEntryForUser(id, user_id) {
  const {
    rows: [entry],
  } = await db.query(
    `
    WITH del AS (
      DELETE FROM entries
      WHERE id = $1 AND user_id = $2
      RETURNING *
    )
    SELECT 
      del.*,
      m.name  AS mood_name,
      m.emoji AS mood_emoji
    FROM del
    JOIN moods m ON m.id = del.mood_id
    `,
    [id, user_id]
  );
  return entry || null;
}
