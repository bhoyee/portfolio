import { apiPath } from "@/api/apiBase";

const jsonHeaders = { "Content-Type": "application/json" };

const safeJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("blog_user_id");
  if (existing) return existing;
  const id = (crypto?.randomUUID?.() || `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`).toString();
  localStorage.setItem("blog_user_id", id);
  return id;
};

const storageKeys = (slug) => ({
  liked: `blog_like:${slug}:liked`,
  count: `blog_like:${slug}:count`,
  comments: `blog_comments:${slug}`,
});

export const getLikes = async (slug) => {
  const userId = getUserId();

  try {
    const url = new URL(apiPath("api/likes.php"), window.location.origin);
    url.searchParams.set("slug", String(slug));
    url.searchParams.set("user_id", String(userId));
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Likes request failed (${res.status})`);
    const data = await safeJson(res);
    if (!data || typeof data.count !== "number") throw new Error("Invalid likes response");
    return { count: data.count, liked: Boolean(data.liked), source: "server" };
  } catch {
    if (typeof window === "undefined") return { count: 0, liked: false, source: "local" };
    const keys = storageKeys(slug);
    const liked = localStorage.getItem(keys.liked) === "true";
    const count = Number(localStorage.getItem(keys.count) || 0);
    return { count, liked, source: "local" };
  }
};

export const toggleLike = async (slug) => {
  const userId = getUserId();

  try {
    const res = await fetch(apiPath("api/likes.php"), {
      method: "POST",
      headers: { ...jsonHeaders, Accept: "application/json" },
      body: JSON.stringify({ slug, user_id: userId }),
    });
    if (!res.ok) throw new Error(`Toggle like failed (${res.status})`);
    const data = await safeJson(res);
    if (!data || typeof data.count !== "number") throw new Error("Invalid toggle response");
    return { count: data.count, liked: Boolean(data.liked), source: "server" };
  } catch {
    if (typeof window === "undefined") return { count: 0, liked: false, source: "local" };
    const keys = storageKeys(slug);
    const prevLiked = localStorage.getItem(keys.liked) === "true";
    const prevCount = Number(localStorage.getItem(keys.count) || 0);
    const liked = !prevLiked;
    const count = Math.max(0, prevCount + (liked ? 1 : -1));
    localStorage.setItem(keys.liked, liked ? "true" : "false");
    localStorage.setItem(keys.count, String(count));
    return { count, liked, source: "local" };
  }
};

export const getComments = async (slug) => {
  try {
    const url = new URL(apiPath("api/comments.php"), window.location.origin);
    url.searchParams.set("slug", String(slug));
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Comments request failed (${res.status})`);
    const data = await safeJson(res);
    if (!data || !Array.isArray(data.comments)) throw new Error("Invalid comments response");
    return { comments: data.comments, source: "server" };
  } catch {
    if (typeof window === "undefined") return { comments: [], source: "local" };
    const keys = storageKeys(slug);
    const raw = localStorage.getItem(keys.comments);
    const comments = raw ? JSON.parse(raw) : [];
    return { comments, source: "local" };
  }
};

export const addComment = async (slug, comment) => {
  const payload = {
    slug,
    author_name: comment.author_name,
    author_email: comment.author_email,
    content: comment.content,
  };

  try {
    const res = await fetch(apiPath("api/comments.php"), {
      method: "POST",
      headers: { ...jsonHeaders, Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Add comment failed (${res.status})`);
    const data = await safeJson(res);
    if (!data || !data.comment) throw new Error("Invalid add comment response");
    return { comment: data.comment, source: "server" };
  } catch {
    if (typeof window === "undefined") return { comment: null, source: "local" };
    const id = `local_${Date.now()}`;
    const newComment = {
      id,
      slug,
      author_name: payload.author_name,
      author_email: payload.author_email,
      content: payload.content,
      created_date: new Date().toISOString(),
      approved: true,
    };
    const keys = storageKeys(slug);
    const raw = localStorage.getItem(keys.comments);
    const comments = raw ? JSON.parse(raw) : [];
    comments.unshift(newComment);
    localStorage.setItem(keys.comments, JSON.stringify(comments));
    return { comment: newComment, source: "local" };
  }
};
