import { Router } from "express";
const router = Router();

/** ----- iTunes (Apple Music) search (no auth required) ----- */
async function searchITunes(q) {
  const url =
    "https://itunes.apple.com/search?" +
    new URLSearchParams({
      media: "music",
      entity: "song",
      limit: "10",
      term: q,
    });
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`iTunes upstream ${r.status}`);
  const data = await r.json();
  return (data.results || []).map((x) => ({
    id: String(x.trackId),
    name: x.trackName,
    artist: x.artistName,
    album: x.collectionName || null,
    artwork: x.artworkUrl100 || x.artworkUrl60 || null,
    previewUrl: x.previewUrl || null,
    url: x.trackViewUrl || x.collectionViewUrl || null,
    _provider: "itunes",
  }));
}

/** ----- Spotify (Client Credentials) optional ----- */
let spotifyToken = null;
let spotifyExpiresAt = 0;

async function getSpotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify credentials not set");

  const now = Date.now();
  if (spotifyToken && now < spotifyExpiresAt - 10_000) return spotifyToken;

  const resp = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!resp.ok) throw new Error(`Spotify token ${resp.status}`);
  const data = await resp.json();
  spotifyToken = data.access_token;
  spotifyExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return spotifyToken;
}

async function searchSpotify(q) {
  const token = await getSpotifyToken();
  const url =
    "https://api.spotify.com/v1/search?" +
    new URLSearchParams({ q, type: "track", limit: "10" });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`Spotify upstream ${r.status}`);
  const data = await r.json();
  const items = data.tracks?.items || [];
  return items.map((t) => ({
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

/** ----- GET /api/songs/search ----- */
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const src = String(req.query.src || req.query.provider || "").toLowerCase();
    if (q.length < 2) return res.json([]);

    // Default to iTunes (better preview coverage). Use Spotify only if requested.

    if (
      src === "spotify" &&
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET
    ) {
      const rows = await searchSpotify(q);
      return res.json(rows);
    }
    const rows = await searchITunes(q);
    return res.json(rows);
  } catch (e) {
    console.error("songs/search error:", e);
    res.status(502).json({ error: e.message || "Song search failed" });
  }
});

export default router;
