import { apiPath } from "@/api/apiBase";

export async function fetchOpenSource({ limit = 50 } = {}) {
  const url = new URL(apiPath("api/open-source.php"), window.location.origin);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return { enabled: true, items: [] };
  }

  const data = await res.json().catch(() => ({}));
  return {
    enabled: data?.enabled !== false,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}
