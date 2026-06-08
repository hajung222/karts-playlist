const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function send(response, status, body) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");
  response.status(status).json(body);
}

function cleanText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 140);
}

function normalizeArtworkUrl(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (/\/600x$/i.test(clean)) return clean.replace(/\/600x$/i, "/600x600bb.jpg");
  if (/\/\d+x\d+bb\.(jpg|jpeg|png|webp)$/i.test(clean)) {
    return clean.replace(/\/\d+x\d+bb\.(jpg|jpeg|png|webp)$/i, "/600x600bb.jpg");
  }
  if (/\/\d+x\d+\.(jpg|jpeg|png|webp)$/i.test(clean)) {
    return clean.replace(/\/\d+x\d+\.(jpg|jpeg|png|webp)$/i, "/600x600bb.jpg");
  }
  if (/\/\d+x\d+bb$/i.test(clean)) {
    return `${clean.replace(/\/\d+x\d+bb$/i, "")}/600x600bb.jpg`;
  }
  return clean;
}

function rowToPost(row) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    school: row.school,
    place: row.place,
    cover: normalizeArtworkUrl(row.cover),
    likes: row.likes || 0,
    likedBy: row.liked_by || [],
    createdAt: new Date(row.created_at).getTime(),
  };
}

module.exports = {
  cleanText,
  getSupabase,
  normalizeArtworkUrl,
  rowToPost,
  send,
};
