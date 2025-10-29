import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INDEX_KEY = '__keys__';

async function readIndex(): Promise<Record<string, true>> {
  try {
    const raw = await getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as Record<string, true>) : {};
  } catch {
    return {};
  }
}

async function writeIndex(idx: Record<string, true>): Promise<void> {
  await setItem(INDEX_KEY, JSON.stringify(idx));
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') await AsyncStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
  const idx = await readIndex();
  if (key !== INDEX_KEY) {
    idx[key] = true;
    await writeIndex(idx);
  }
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') await AsyncStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
  const idx = await readIndex();
  if (key in idx) {
    delete idx[key];
    await writeIndex(idx);
  }
}

export default {
  getItem,
  setItem,
  removeItem,
};


