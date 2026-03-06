const safeJson = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

export const submitContactMessage = async (message) => {
  const res = await fetch(`/api/contact.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(message),
  });

  if (!res.ok) throw new Error(`Contact request failed (${res.status})`);
  const data = await safeJson(res);
  if (!data || data.ok !== true) throw new Error("Invalid contact response");
  return data;
};

