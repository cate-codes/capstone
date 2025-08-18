// api/entries.js
import { Router } from "express";

const router = Router();

// ---- demo moods
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

// ---- in-memory entries for demo
let nextEntryId = 2;
const entries = [
  {
    id: 1,
    date: new Date().toISOString(),
    mood_id: 1,
    journal_text: "First entry — feeling good!",
    song_id: null,
  },
];

const withMood = (e) => {
  const m = moods.find((x) => x.id === Number(e.mood_id));
  return { ...e, mood_name: m?.name ?? null, mood_emoji: m?.emoji ?? null };
};

// GET /api/moods
router.get("/moods", (_req, res) => res.json(moods));

// GET /api/entries
router.get("/entries", (_req, res) => {
  const list = entries.map(withMood).sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json(list);
});

// GET /api/entries/:id
router.get("/entries/:id", (req, res) => {
  const id = Number(req.params.id);
  const e = entries.find((x) => x.id === id);
  if (!e) return res.status(404).json({ error: "Not found" });
  res.json(withMood(e));
});

// POST /api/entries
router.post("/entries", (req, res) => {
  const { mood_id, journal_text, song } = req.body || {};
  if (!mood_id) return res.status(400).json({ error: "mood_id is required" });

  const e = {
    id: nextEntryId++,
    date: new Date().toISOString(),
    mood_id: Number(mood_id),
    journal_text: journal_text ?? "",
    song: song
      ? {
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album ?? null,
          artwork: song.artwork ?? null,
          previewUrl: song.previewUrl ?? null,
          url: song.url ?? null,
        }
      : null,
  };
  entries.push(e);
  res.status(201).json(withMood(e));
});

// PUT /api/entries/:id
router.put("/entries/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = entries.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const { mood_id, journal_text, song, date } = req.body || {};
  if (mood_id !== undefined) entries[idx].mood_id = Number(mood_id);
  if (journal_text !== undefined) entries[idx].journal_text = journal_text;
  if (date !== undefined) entries[idx].date = date;
  if (song !== undefined) {
    entries[idx].song = song
      ? {
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album ?? null,
          artwork: song.artwork ?? null,
          previewUrl: song.previewUrl ?? null,
          url: song.url ?? null,
        }
      : null;
  }
  res.json(withMood(entries[idx]));
});

// DELETE /api/entries/:id
router.delete("/entries/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = entries.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  entries.splice(idx, 1);
  res.json({ ok: true });
});

export default router;

// // --- iTunes + Spotify songs search (normalized) ---
// router.get("/songs/search", async (req, res) => {
//   try {
//     const q = (req.query.q || "").toString().trim();
//     const provider = (
//       req.query.provider ||
//       process.env.SONGS_PROVIDER ||
//       "itunes"
//     ).toLowerCase();
//     if (!q) return res.json([]);

//     if (provider === "spotify") {
//       const results = await spotifySearch(q);
//       return res.json(results);
//     } else {
//       const results = await itunesSearch(q);
//       return res.json(results);
//     }
//   } catch (e) {
//     console.error("songs/search error:", e);
//     res.status(500).json({ error: "Search failed" });
//   }
// });

// --- Songs search (iTunes; robust + helpful errors)
router.get("/songs/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.json([]);

    const url =
      "https://itunes.apple.com/search?" +
      new URLSearchParams({
        media: "music",
        entity: "song",
        limit: "10",
        term: q,
      });

    // Add basic headers; Node 18+ has global fetch
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MoodTune/1.0" },
    });

    // Read text so if JSON parsing fails we can show a snippet
    const text = await r.text();
    if (!r.ok) {
      console.error("iTunes error:", r.status, text.slice(0, 200));
      return res.status(502).json({ error: `iTunes ${r.status}` });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Bad JSON from iTunes:", text.slice(0, 200));
      return res.status(502).json({ error: "Bad JSON from iTunes" });
    }

    const results = (data.results || []).map((x) => ({
      id: String(x.trackId),
      name: x.trackName,
      artist: x.artistName,
      album: x.collectionName,
      artwork: x.artworkUrl100 || x.artworkUrl60 || null,
      previewUrl: x.previewUrl || null,
      url: x.trackViewUrl || x.collectionViewUrl || null,
    }));

    res.json(results);
  } catch (e) {
    // Surface the real reason to the client so you can see it
    console.error("songs/search error:", e);
    res.status(500).json({ error: e.message || "Search failed" });
  }
});

// --- iTunes implementation (no key required)
router.get("/songs/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.json([]);

    const url =
      "https://itunes.apple.com/search?" +
      new URLSearchParams({
        media: "music",
        entity: "song",
        limit: "10",
        term: q,
      });

    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: "Upstream search failed" });
    const data = await r.json();

    const results = (data.results || []).map((x) => ({
      id: x.trackId,
      name: x.trackName,
      artist: x.artistName,
      album: x.collectionName,
      artwork: x.artworkUrl100 || x.artworkUrl60 || null,
      previewUrl: x.previewUrl || null,
      url: x.trackViewUrl || x.collectionViewUrl || null,
    }));

    res.json(results);
  } catch (e) {
    console.error("songs/search error:", e);
    res.status(500).json({ error: "Search failed" });
  }
});

// --- Spotify implementation (Client Credentials Flow)
let spotifyToken = null;
let spotifyExpiresAt = 0;

async function getSpotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify credentials not set");

  const now = Date.now();
  if (spotifyToken && now < spotifyExpiresAt - 10_000) return spotifyToken; // reuse if not near expiry

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!resp.ok) throw new Error("Spotify token request failed");
  const data = await resp.json();
  spotifyToken = data.access_token;
  spotifyExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return spotifyToken;
}

async function spotifySearch(q) {
  const token = await getSpotifyToken();
  const url =
    "https://api.spotify.com/v1/search?" +
    new URLSearchParams({
      q,
      type: "track",
      limit: "10",
    });

  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("Spotify upstream error");
  const data = await r.json();

  const tracks = data.tracks?.items || [];
  return tracks.map((t) => ({
    id: t.id,
    name: t.name,
    artist: (t.artists || []).map((a) => a.name).join(", "),
    album: t.album?.name || null,
    artwork: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || null,
    previewUrl: t.preview_url || null,
    url: t.external_urls?.spotify || null,
    _provider: "spotify",
  }));
}
