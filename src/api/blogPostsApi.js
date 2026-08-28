import { apiPath } from "@/api/apiBase";

const safeJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

export const fetchPosts = async () => {
  const res = await fetch(apiPath("api/posts.php"), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Posts request failed (${res.status})`);
  const data = await safeJson(res);
  if (!data || !Array.isArray(data.posts)) throw new Error("Invalid posts response");
  return data.posts;
};

export const fetchPostBySlug = async (slug) => {
  const url = new URL(apiPath("api/posts.php"), window.location.origin);
  url.searchParams.set("slug", String(slug));
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Post request failed (${res.status})`);
  const data = await safeJson(res);
  if (!data || !data.post) throw new Error("Invalid post response");
  return data.post;
};
