/**
 * 🎛️ UI Config - Storage Layer
 * Handles persistence of UI config to AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import type { UIConfig } from '@pawfectmatch/core';

const STORAGE_KEYS = {
  CURRENT_CONFIG: '@ui_config:current',
  LAST_FETCH: '@ui_config:last_fetch',
  PREVIEW_CODE: '@ui_config:preview_code',
} as const;

/**
 * Save config to storage
 */
export async function saveConfig(config: UIConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG, JSON.stringify(config));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
    logger.debug('UI config saved to storage', { version: config.version });
  } catch (error) {
    logger.error('Failed to save UI config', { error });
    throw error;
  }
}

/**
 * Load config from storage
 */
export async function loadConfigFromStorage(): Promise<UIConfig | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CONFIG);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as UIConfig;
  } catch (error) {
    logger.error('Failed to load UI config from storage', { error });
    return null;
  }
}

/**
 * Save preview code
 */
export async function savePreviewCode(code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREVIEW_CODE, code);
  } catch (error) {
    logger.error('Failed to save preview code', { error });
  }
}

/**
 * Load preview code
 */
export async function loadPreviewCode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PREVIEW_CODE);
  } catch (error) {
    logger.error('Failed to load preview code', { error });
    return null;
  }
}

/**
 * Clear preview code
 */
export async function clearPreviewCode(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PREVIEW_CODE);
  } catch (error) {
    logger.error('Failed to clear preview code', { error });
  }
}

/**
 * Get last fetch timestamp
 */
export async function getLastFetchTime(): Promise<number | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH);
    return stored ? parseInt(stored, 10) : null;
  } catch (error) {
    logger.error('Failed to get last fetch time', { error });
    return null;
  }
}

/**
 * Clear all stored config data
 */
export async function clearConfigStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CURRENT_CONFIG,
      STORAGE_KEYS.LAST_FETCH,
      STORAGE_KEYS.PREVIEW_CODE,
    ]);
  } catch (error) {
    logger.error('Failed to clear config storage', { error });
  }
}
