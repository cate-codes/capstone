// api/entries.js
import { Router } from "express";

const router = Router();

/* Lightweight mood map so responses include mood_name/emoji */
const moods = [
  { id: 1, name: "Happy", emoji: "😋" },
  { id: 2, name: "Calm", emoji: "😌" },
  { id: 3, name: "Sad", emoji: "😔" },
  { id: 4, name: "Angry", emoji: "😡" },
  { id: 5, name: "Excited", emoji: "🤩" },
  { id: 6, name: "Anxious", emoji: "😰" },
  { id: 7, name: "Stressed", emoji: "😵‍💫" },
  { id: 8, name: "Tired", emoji: "😴" },
  { id: 9, name: "Lonely", emoji: "🥺" },
  { id: 10, name: "Grateful", emoji: "🙏" },
  { id: 11, name: "Confident", emoji: "😎" },
  { id: 12, name: "Bored", emoji: "🥱" },
  { id: 13, name: "Sick", emoji: "🤒" },
  { id: 14, name: "Relaxed", emoji: "🧘" },
  { id: 15, name: "Hopeful", emoji: "🌤️" },
  { id: 16, name: "Defeated", emoji: "😞" },
  { id: 17, name: "In Love", emoji: "😍" },
  { id: 18, name: "Loved", emoji: "🥰" },
];

/* In-memory per-user storage so you can create entries right away */
const entriesByUser = new Map(); // Map<userId, Entry[]>
const nextIdByUser = new Map(); // Map<userId, number>

function userEntries(userId) {
  if (!entriesByUser.has(userId)) entriesByUser.set(userId, []);
  return entriesByUser.get(userId);
}
function nextId(userId) {
  const cur = nextIdByUser.get(userId) ?? 1;
  nextIdByUser.set(userId, cur + 1);
  return cur;
}
function withMood(e) {
  const m = moods.find((x) => x.id === Number(e.mood_id));
  return { ...e, mood_name: m?.name ?? null, mood_emoji: m?.emoji ?? null };
}

/* ------------------------------ GET /api/entries ------------------------------ */
router.get("/", (req, res) => {
  const uid = req.user.id;
  const list = userEntries(uid)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(withMood);
  res.json(list);
});

/* --------------------------- GET /api/entries/:id ---------------------------- */
router.get("/:id", (req, res) => {
  const uid = req.user.id;
  const id = Number(req.params.id);
  const e = userEntries(uid).find((x) => x.id === id);
  if (!e) return res.status(404).json({ error: "Not found" });
  res.json(withMood(e));
});

/* ------------------------------ POST /api/entries ---------------------------- */
router.post("/", (req, res) => {
  const uid = req.user.id;
  const { mood_id, journal_text, song } = req.body || {};
  if (!mood_id) return res.status(400).json({ error: "mood_id is required" });

  const entry = {
    id: nextId(uid),
    user_id: uid,
    date: new Date().toISOString(),
    mood_id: Number(mood_id),
    journal_text: journal_text ?? "",
    song: song
      ? {
          id: String(song.id),
          name: song.name,
          artist: song.artist,
          album: song.album ?? null,
          artwork: song.artwork ?? null,
          previewUrl: song.previewUrl ?? null,
          url: song.url ?? null,
        }
      : null,
  };

  userEntries(uid).push(entry);
  res.status(201).json(withMood(entry));
});

/* ------------------------------ PUT /api/entries/:id ------------------------- */
router.put("/:id", (req, res) => {
  const uid = req.user.id;
  const id = Number(req.params.id);
  const list = userEntries(uid);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const { mood_id, journal_text, song, date } = req.body || {};
  if (mood_id !== undefined) list[idx].mood_id = Number(mood_id);
  if (journal_text !== undefined) list[idx].journal_text = journal_text;
  if (date !== undefined) list[idx].date = date;
  if (song !== undefined) {
    list[idx].song = song
      ? {
          id: String(song.id),
          name: song.name,
          artist: song.artist,
          album: song.album ?? null,
          artwork: song.artwork ?? null,
          previewUrl: song.previewUrl ?? null,
          url: song.url ?? null,
        }
      : null;
  }
  res.json(withMood(list[idx]));
});

/* ------------------------------ DELETE /api/entries/:id ---------------------- */
router.delete("/:id", (req, res) => {
  const uid = req.user.id;
  const id = Number(req.params.id);
  const list = userEntries(uid);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  list.splice(idx, 1);
  res.json({ ok: true });
});

export default router;
