const {
  cleanText,
  getSupabase,
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
  if (request.method !== "POST") return send(response, 405, { error: "method_not_allowed" });

  try {
    const supabase = getSupabase();
    const body = request.body || {};
    const postId = cleanText(body.postId);
    const clientId = cleanText(body.clientId);

    const { data: row, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !row) {
      return send(response, 404, {
        error: "not_found",
        posts: await listPosts(supabase),
      });
    }

    const likedBy = Array.isArray(row.liked_by) ? row.liked_by : [];
    if (clientId && likedBy.includes(clientId)) {
      return send(response, 200, {
        liked: false,
        posts: await listPosts(supabase),
      });
    }

    const nextLikedBy = clientId ? [...likedBy, clientId] : likedBy;
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        likes: Number(row.likes || 0) + 1,
        liked_by: nextLikedBy,
      })
      .eq("id", postId);

    if (updateError) throw updateError;

    return send(response, 200, {
      liked: true,
      posts: await listPosts(supabase),
    });
  } catch (error) {
    return send(response, 500, {
      error: "server_error",
      message: error.message,
    });
  }
};
