import db from "#db/client";

export async function getAllMoods() {
  const { rows } = await db.query(`SELECT * FROM moods ORDER BY id`);
  return rows;
}

export async function getMoodById(id) {
  const {
    rows: [mood],
  } = await db.query(`SELECT id, name, emoji FROM moods WHERE id = $1`, [id]);
  return mood || null;
}
