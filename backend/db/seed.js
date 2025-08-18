import db from "#db/client";
import { createUser, getUserByUsername } from "#db/queries/users";

await db.connect();

async function seed() {
  console.log("🌱 Starting seed...");

  // seed user
  const existingUser = await getUserByUsername("foo");
  if (!existingUser) {
    await createUser("foo", "foo@example.com", "bar");
    console.log("👤 Created user: foo");
  } else {
    console.log("👤 User 'foo' already exists");
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
      `INSERT INTO moods (name, emoji)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
      [mood.name, mood.emoji]
    );
  }
  console.log("🎭 Moods seeded successfully");

  console.log("✅ Seeding complete.");
}

await seed();
await db.end();
