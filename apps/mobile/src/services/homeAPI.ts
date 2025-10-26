const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";

export async function getHomeStats() {
  const res = await fetch(`${API_URL}/api/home/stats`);
  if (!res.ok) throw new Error("home stats failed");
  return res.json();
}

export async function getActivityFeed() {
  const res = await fetch(`${API_URL}/api/home/feed`);
  if (!res.ok) throw new Error("home feed failed");
  return res.json();
}

