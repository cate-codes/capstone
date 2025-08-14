import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser(username, email, password) {
  const sql = `
  INSERT INTO users
    (username, email, password)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [username, email, hashedPassword]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}

export async function getUserByUsername(username) {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  return user;
}

export async function updateEntryForUser(
  id,
  user_id,
  { mood_id = null, song_id = null, journal_text = null } = {}
) {
  // Coerce any undefined that slipped through to null to satisfy pg
  const p_mood_id = mood_id === undefined ? null : mood_id;
  const p_song_id = song_id === undefined ? null : song_id;
  const p_text = journal_text === undefined ? null : journal_text;

  const {
    rows: [entry],
  } = await db.query(
    `
    UPDATE entries
    SET
      mood_id      = COALESCE($3, mood_id),
      song_id      = $4,
      journal_text = COALESCE($5, journal_text)
    WHERE id = $1 AND user_id = $2
    RETURNING *
    `,
    [id, user_id, p_mood_id, p_song_id, p_text]
  );
  return entry || null;
}
