// integrations/spotify.js
import "dotenv/config";
import axios from "axios";
import qs from "qs";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";

let appToken = null; // { access_token, expires_at }

/** Get an app access token via Client Credentials */
async function fetchAppToken() {
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post(
    SPOTIFY_TOKEN_URL,
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  appToken = {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + (data.expires_in - 60) * 1000),
  };
  return appToken.access_token;
}

async function getAppAccessToken() {
  if (!appToken || new Date() >= appToken.expires_at) {
    return fetchAppToken();
  }
  return appToken.access_token;
}

/** Search tracks on Spotify (no user login required) */
export async function searchTracks(q, limit = 10) {
  const token = await getAppAccessToken();
  const { data } = await axios.get(`${SPOTIFY_API}/search`, {
    params: { q, type: "track", limit },
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.tracks.items.map((t) => ({
    spotify_id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album?.name ?? null,
    preview_url: t.preview_url,
    uri: t.uri,
    image_url: t.album?.images?.[0]?.url ?? null,
  }));
}

export async function getTrackById(spotify_id) {
  const token = await getAppAccessToken();
  const { data: t } = await axios.get(`${SPOTIFY_API}/tracks/${spotify_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    spotify_id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album?.name ?? null,
    preview_url: t.preview_url,
    uri: t.uri,
    image_url: t.album?.images?.[0]?.url ?? null,
  };
}
