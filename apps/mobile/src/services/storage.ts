import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const v = await AsyncStorage.getItem(key);
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}

export async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

