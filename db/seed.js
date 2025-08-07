import db from "#db/client";
import { createUser, getUserByUsername } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //  check to see if user exists before creating
  const existing = await getUserByUsername("foo");
  if (!existing) {
    // seed test user
    await createUser("foo", "foo@example.com", "bar");
  }
}

// seed the moooodz
const moods = [
  { name: "Happy", emoji: "😋" },
  { name: "Sad", emoji: "😔" },
  { name: "Anxious", emoji: "😰" },
  { name: "Defeated", emoji: "😞" },
  { name: "Excited", emoji: "🤩" },
  { name: "Calm", emoji: "😌" },
  { name: "Angry", emoji: "😡" },
  { name: "Tired", emoji: "😴" },
  { name: "In Love", emoji: "😍" },
  { name: "Loved", emoji: "🥰" },
];

for (const mood of moods) {
  await db.query(
    `INSERT INTO moods (name, emoji) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
    [mood.name, mood.emoji]
  );
}

console.log("✅ User seeded.");
console.log("✅ Moods seeded.");
