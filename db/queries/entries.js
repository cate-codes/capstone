import db from "#db/client";

export async function createEntry({
  user_id,
  mood_id,
  song_id = null,
  journal_text,
}) {
  const sql = `
    INSERT INTO entries (user_id, mood_id, song_id, journal_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const {
    rows: [entry],
  } = await db.query(sql, [user_id, mood_id, song_id, journal_text]);

  return entry;
}
