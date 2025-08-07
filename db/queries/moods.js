import db from "#db/client";

export async function getAllMoods() {
  const result = await db.query(`SELECT * FROM moods ORDER BY id`);
  return result.rows;
}
