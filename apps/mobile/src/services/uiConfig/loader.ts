/**
 * 🎛️ UI Config - Loader
 * Handles fetching, validating, and caching UI configs
 */

import { logger } from '@pawfectmatch/core';
import { uiConfigSchema, type UIConfig } from '@pawfectmatch/core';
import { getDefaultUIConfig } from './defaults';
import {
  saveConfig,
  loadConfigFromStorage,
  getLastFetchTime,
  loadPreviewCode,
  clearPreviewCode,
  savePreviewCode,
} from './storage';
import { request } from '../api';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoadConfigOptions {
  audience?: {
    env?: 'dev' | 'stage' | 'prod';
    pct?: number;
    countryAllow?: string[];
  };
  forceRefresh?: boolean;
  previewCode?: string;
}

/**
 * Validate config against schema
 */
function validateConfig(config: unknown): UIConfig | null {
  try {
    return uiConfigSchema.parse(config);
  } catch (error) {
    logger.error('UI config validation failed', { error });
    return null;
  }
}

/**
 * Fetch config from API
 */
async function fetchConfigFromAPI(options: LoadConfigOptions): Promise<UIConfig | null> {
  try {
    let endpoint = '/api/ui-config/current';
    const params: Record<string, string> = {};

    if (options.audience?.env) {
      params.env = options.audience.env;
    }

    if (options.previewCode) {
      // Use preview endpoint instead
      endpoint = `/api/ui-config/preview/${options.previewCode}`;
    }

    const response = await request<{ success: boolean; data?: { config: UIConfig } }>(endpoint, {
      method: 'GET',
      params,
    });

    if (!response.success || !response.data?.config) {
      logger.warn('Failed to fetch UI config from API', { response });
      return null;
    }

    const validated = validateConfig(response.data.config);
    if (!validated) {
      logger.error('Fetched config failed validation');
      return null;
    }

    // Save to storage (unless preview)
    if (!options.previewCode) {
      await saveConfig(validated);
    }

    return validated;
  } catch (error) {
    logger.error('Error fetching UI config from API', { error });
    return null;
  }
}

/**
 * Load UI config with fallback chain:
 * 1. Preview code (if set)
 * 2. API (if not cached or forced)
 * 3. Cached storage
 * 4. Embedded defaults
 */
export async function loadConfig(options: LoadConfigOptions = {}): Promise<UIConfig> {
  // Check for preview code first
  const previewCode = options.previewCode || (await loadPreviewCode());
  if (previewCode) {
    logger.info('Loading preview config', { code: previewCode });
    const previewConfig = await fetchConfigFromAPI({ ...options, previewCode });
    if (previewConfig) {
      return previewConfig;
    }
    // If preview fails, clear the code
    await clearPreviewCode();
  }

  // Check cache freshness
  const lastFetch = await getLastFetchTime();
  const cacheValid = lastFetch && Date.now() - lastFetch < CACHE_TTL_MS;

  if (!options.forceRefresh && cacheValid) {
    const cached = await loadConfigFromStorage();
    if (cached) {
      logger.debug('Using cached UI config', { version: cached.version });
      return cached;
    }
  }

  // Fetch from API
  logger.info('Fetching UI config from API');
  const apiConfig = await fetchConfigFromAPI(options);
  if (apiConfig) {
    return apiConfig;
  }

  // Fallback to cached (even if stale)
  const staleCache = await loadConfigFromStorage();
  if (staleCache) {
    logger.warn('Using stale cached config', { version: staleCache.version });
    return staleCache;
  }

  // Final fallback to embedded defaults
  logger.warn('Using embedded default UI config');
  return getDefaultUIConfig();
}

/**
 * Load config by preview code
 */
export async function loadPreviewConfig(code: string): Promise<UIConfig | null> {
  const config = await fetchConfigFromAPI({ previewCode: code });
  if (config) {
    await savePreviewCode(code);
  }
  return config;
}

/**
 * Clear preview mode
 */
export async function clearPreviewMode(): Promise<void> {
  await clearPreviewCode();
  // Optionally reload config
}
