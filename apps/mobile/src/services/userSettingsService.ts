import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";
const KEY = "user_settings_v1";

export interface UserSettings {
  maxDistance?: number;
  ageRange?: { min: number; max: number };
  species?: string[];
  intents?: string[];
  notifications?: {
    email?: boolean;
    push?: boolean;
    matches?: boolean;
    messages?: boolean;
  };
  [key: string]: unknown;
}

export async function getSettings(): Promise<UserSettings> {
  const cached = await AsyncStorage.getItem(KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as UserSettings;
    } catch {
      // Ignore parse errors
    }
  }
  
  try {
    const res = await fetch(`${API_URL}/api/settings/me`);
    const data = res.ok ? (await res.json() as UserSettings) : {};
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
}

export async function updateSettings(patch: UserSettings): Promise<UserSettings> {
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
    const updated = { ...current, ...patch } as UserSettings;
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  }
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

