import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';

export interface SettingsData {
  [key: string]: string | number | boolean | null;
}

export interface UseSettingsPersistenceOptions {
  key: string;
  initialData?: SettingsData;
}

export interface UseSettingsPersistenceReturn {
  loadSettings: () => Promise<SettingsData>;
  saveSettings: (data: SettingsData) => Promise<void>;
  clearSettings: () => Promise<void>;
}

/**
 * Hook for persisting settings data to AsyncStorage
 */
export function useSettingsPersistence({
  key,
  initialData = {},
}: UseSettingsPersistenceOptions): UseSettingsPersistenceReturn {
  const loadSettings = useCallback(async (): Promise<SettingsData> => {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialData;
    } catch (error) {
      logger.error(`Failed to load settings for key "${key}":`, { error });
      return initialData;
    }
  }, [key, initialData]);

  const saveSettings = useCallback(
    async (data: SettingsData): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        logger.error(`Failed to save settings for key "${key}":`, { error });
      }
    },
    [key],
  );

  const clearSettings = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to clear settings for key "${key}":`, { error });
    }
  }, [key]);

  return {
    loadSettings,
    saveSettings,
    clearSettings,
  };
}
