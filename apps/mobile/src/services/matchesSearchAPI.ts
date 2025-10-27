const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";

export async function fetchMatches(params: { q?: string; filters?: Record<string, any> }) {
  const res = await fetch(`${API_URL}/api/matches/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("matches search failed");
  return res.json();
}

