//
// Jamendo API client - simple public GET helpers
//
// Base URL: https://api.jamendo.com/v3.0
// Uses REACT_APP_JAMENDO_CLIENT_ID from environment.
// Do NOT include client secret in frontend calls. If REACT_APP_JAMENDO_CLIENT_SECRET is present,
// it is reserved for backend proxy usage only (TODO).
//

const BASE_URL = "https://api.jamendo.com/v3.0";

/**
 * Get Jamendo client ID from environment.
 * Returns empty string if not set, callers should handle missing client id gracefully.
 */
// PUBLIC_INTERFACE
export function getJamendoClientId() {
  /** Returns the Jamendo client ID to use on the frontend. */
  return process.env.REACT_APP_JAMENDO_CLIENT_ID || "";
}

/**
 * Build a URL with query params appended.
 */
function buildUrl(path, params) {
  const u = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.toString();
}

/**
 * Normalize a Jamendo track object to the frontend track shape we expect.
 * Prefer HTTPS URLs and the 'audio' field which is typically a preview (Jamendo "audio" is a streamable URL).
 */
function normalizeTrack(t) {
  // Jamendo fields typically include:
  // id, name, artist_name, image, audio, audiodownload (requires auth sometimes), shorturl, shareurl
  // We prefer t.audio which is https preview stream.
  const audioUrl = (t.audio || t.audiopreview || "").replace(/^http:\/\//i, "https://");
  const imageUrl = (t.image || "").replace(/^http:\/\//i, "https://");
  return {
    id: t.id,
    name: t.name,
    artist_name: t.artist_name,
    image: imageUrl,
    audio: audioUrl,
  };
}

/**
 * Handle fetch with graceful error handling and rate-limit fallback.
 */
async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { method: "GET", mode: "cors" });
    if (!res.ok) {
      // 429/5xx etc
      return { headers: [], results: [], error: `Request failed: ${res.status}` };
    }
    const data = await res.json();
    // Jamendo JSON as { headers: {...}, results: [...] }
    return data;
  } catch (e) {
    return { headers: [], results: [], error: e?.message || "Network error" };
  }
}

/**
 * PUBLIC_INTERFACE
 * Search tracks on Jamendo using fuzzy/name search.
 */
export async function searchTracks({ query, page = 1, pageSize = 30 } = {}) {
  /** Search Jamendo tracks by query and return normalized items with id, name, artist_name, image, audio. */
  const clientId = getJamendoClientId();
  if (!clientId || !query) {
    return { items: [], error: !clientId ? "Missing Jamendo Client ID" : "" };
  }
  const limit = Math.max(1, Math.min(100, pageSize));
  const offset = (Math.max(1, page) - 1) * limit;

  const url = buildUrl("/tracks", {
    format: "json",
    client_id: clientId,
    limit,
    offset,
    has_preview: "true",
    fuzzysearch: "true",
    namesearch: query,
    order: "popularity_total",
  });

  const data = await safeFetchJson(url);
  if (data.error) return { items: [], error: data.error };

  const items = (data.results || []).map(normalizeTrack).filter(t => !!t.audio);
  return { items, error: "" };
}

/**
 * PUBLIC_INTERFACE
 * Get featured tracks (simple proxy to tracks endpoint with popularity ordering).
 */
export async function getFeaturedTracks({ page = 1, pageSize = 30 } = {}) {
  /** Return popular tracks from Jamendo with preview audio for Home feed. */
  const clientId = getJamendoClientId();
  if (!clientId) {
    return { items: [], error: "Missing Jamendo Client ID" };
  }
  const limit = Math.max(1, Math.min(100, pageSize));
  const offset = (Math.max(1, page) - 1) * limit;

  const url = buildUrl("/tracks", {
    format: "json",
    client_id: clientId,
    limit,
    offset,
    has_preview: "true",
    order: "popularity_total",
  });

  const data = await safeFetchJson(url);
  if (data.error) return { items: [], error: data.error };

  const items = (data.results || []).map(normalizeTrack).filter(t => !!t.audio);
  return { items, error: "" };
}

/**
 * TODO:
 * - Backend proxy to protect secrets and enable additional Jamendo endpoints requiring auth.
 * - Pagination helpers with next/prev.
 * - Additional filters (tags, duration, moods).
 */
