import { apiPath } from "@/api/apiBase";

export async function getResume() {
  const res = await fetch(apiPath("api/resume.php"), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    return { url: null };
  }

  const data = await res.json().catch(() => ({}));
  return { url: typeof data?.url === "string" ? data.url : null };
}
