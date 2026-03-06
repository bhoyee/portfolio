export const submitContactMessage = async (message) => {
  const res = await fetch(`/api/contact.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(message),
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    const maybeJson = contentType.includes("application/json") ? (() => {
      try {
        return text ? JSON.parse(text) : null;
      } catch {
        return null;
      }
    })() : null;

    const serverError = maybeJson?.error ? `: ${maybeJson.error}` : "";
    throw new Error(`Contact request failed (${res.status})${serverError}`);
  }

  if (!contentType.includes("application/json")) {
    if (text.trim().startsWith("<?php")) {
      throw new Error("Contact backend is not running. PHP files are being served as text (local Vite dev can't execute PHP). Deploy the site to your hosting (or run a local PHP server) to enable contact submissions.");
    }
    throw new Error("Contact backend returned a non-JSON response. Check shared hosting rewrite rules so `/api/contact.php` is served as PHP (not routed to index.html).");
  }

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!data || data.ok !== true) throw new Error("Invalid contact response");
  return data;
};
