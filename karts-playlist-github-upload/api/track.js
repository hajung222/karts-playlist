const { normalizeArtworkUrl, send } = require("./_supabase");

async function searchTrack(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5&country=KR`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

function pickBest(results, title, artist) {
  const safeTitle = title.toLowerCase();
  const safeArtist = artist.toLowerCase();
  return results
    .filter((item) => item.trackName && item.artistName && item.artworkUrl100)
    .sort((a, b) => {
      const at = String(a.trackName).toLowerCase();
      const aa = String(a.artistName).toLowerCase();
      const bt = String(b.trackName).toLowerCase();
      const ba = String(b.artistName).toLowerCase();
      const score = (t, ar) =>
        (t === safeTitle ? 4 : 0) +
        (t.includes(safeTitle) ? 2 : 0) +
        (safeArtist && ar === safeArtist ? 4 : 0) +
        (safeArtist && ar.includes(safeArtist) ? 2 : 0);
      return score(bt, ba) - score(at, aa);
    })[0] || null;
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method !== "GET") return send(response, 405, { error: "method_not_allowed" });

  const title = String(request.query.title || "").trim();
  const artist = String(request.query.artist || "").trim();
  if (!title) return send(response, 400, { error: "missing_title" });

  const queries = [
    artist ? `${artist} ${title}` : "",
    artist ? `${title} ${artist}` : "",
    title,
  ].filter(Boolean);

  for (const query of queries) {
    try {
      const results = await searchTrack(query);
      const result = pickBest(results || [], title, artist);
      if (result) {
        return send(response, 200, {
          track: {
            title: result.trackName,
            artist: result.artistName,
            cover: normalizeArtworkUrl(result.artworkUrl100),
          },
        });
      }
    } catch {
    }
  }

  return send(response, 404, { track: null });
};
