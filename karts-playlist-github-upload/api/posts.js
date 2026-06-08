const {
  cleanText,
  getSupabase,
  normalizeArtworkUrl,
  rowToPost,
  send,
} = require("./_supabase");

async function listPosts(supabase) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToPost);
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") return send(response, 204, {});

  try {
    const supabase = getSupabase();

    if (request.method === "GET") {
      return send(response, 200, { posts: await listPosts(supabase) });
    }

    if (request.method === "POST") {
      const body = request.body || {};
      const post = {
        title: cleanText(body.title, "Untitled"),
        artist: cleanText(body.artist, "Unknown Artist"),
        school: cleanText(body.school, "영상원"),
        place: cleanText(body.place, "학교 가는 중"),
        cover: normalizeArtworkUrl(body.cover),
        likes: 1,
        liked_by: [],
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(post)
        .select("*")
        .single();

      if (error) throw error;
      return send(response, 200, {
        post: rowToPost(data),
        posts: await listPosts(supabase),
      });
    }

    return send(response, 405, { error: "method_not_allowed" });
  } catch (error) {
    return send(response, 500, {
      error: "server_error",
      message: error.message,
    });
  }
};
