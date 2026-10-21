// JSON fetch for the admin screens; throws the API's error message on failure
export const request = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || "Request failed");
  return body;
};
