/**
 * 🎛️ UI Config - React Hook
 * Provides typed UIConfig with reactive updates
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { logger } from '@pawfectmatch/core';
import type { UIConfig } from '@pawfectmatch/core';
import { loadConfig, type LoadConfigOptions } from './loader';

export interface UseUIConfigResult {
  config: UIConfig;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  version: string;
  status: UIConfig['status'];
}

/**
 * React hook for accessing UI config
 */
export function useUIConfig(options: LoadConfigOptions = {}): UseUIConfigResult {
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loaded = await loadConfig(options);
      setConfig(loaded);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load UI config');
      logger.error('Error loading UI config', { error });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh config when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        logger.debug('App foregrounded, refreshing UI config');
        void load();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [load]);

  if (!config) {
    // Return default config while loading
    const { getDefaultUIConfig } = require('./defaults');
    const defaultConfig = getDefaultUIConfig();
    return {
      config: defaultConfig,
      isLoading,
      error,
      refresh: load,
      version: defaultConfig.version,
      status: defaultConfig.status,
    };
  }

  return {
    config,
    isLoading,
    error,
    refresh: load,
    version: config.version,
    status: config.status,
  };
}

/**
 * Hook for preview mode
 */
export function usePreviewConfig(code: string | null) {
  return useUIConfig({
    previewCode: code || undefined,
    forceRefresh: !!code,
  });
}
