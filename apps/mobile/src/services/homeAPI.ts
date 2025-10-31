const getApiUrl = () => process.env['EXPO_PUBLIC_API_URL'] || process.env['API_URL'] || '';

export async function getHomeStats() {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/home/stats`);
  if (!res.ok) throw new Error('home stats failed');
  return res.json();
}

export async function getActivityFeed() {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/home/feed`);
  if (!res.ok) throw new Error('home feed failed');
  return res.json();
}
