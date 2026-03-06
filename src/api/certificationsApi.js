export const fetchCertifications = async () => {
  const res = await fetch("/api/certifications.php", {
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = json?.error ? `: ${json.error}` : "";
    throw new Error(`Failed to load certifications (${res.status})${err}`);
  }

  return Array.isArray(json?.certifications) ? json.certifications : [];
};

