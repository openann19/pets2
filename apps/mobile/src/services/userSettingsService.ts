import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";
const KEY = "user_settings_v1";

export async function getSettings(): Promise<Record<string, any>> {
  const cached = await AsyncStorage.getItem(KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore parse errors
    }
  }
  
  try {
    const res = await fetch(`${API_URL}/api/settings/me`);
    const data = res.ok ? await res.json() : {};
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
}

export async function updateSettings(patch: Record<string, any>): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${API_URL}/api/settings/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = res.ok ? await res.json() : patch;
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    // Fallback to cache only on error
    const current = await getSettings();
    const updated = { ...current, ...patch };
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  }
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

