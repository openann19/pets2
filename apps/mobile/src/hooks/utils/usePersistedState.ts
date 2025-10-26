import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../../services/logger";

export interface UsePersistedStateOptions<T> {
  key: string;
  initialValue: T;
  enabled?: boolean;
}

export interface UsePersistedStateReturn<T> {
  value: T;
  setValue: (value: T) => void;
  isLoading: boolean;
  clearStorage: () => Promise<void>;
}

/**
 * Hook for persisting state to AsyncStorage
 *
 * @example
 * const { value, setValue } = usePersistedState({
 *   key: 'user_preferences',
 *   initialValue: { theme: 'light' }
 * });
 */
export function usePersistedState<T>({
  key,
  initialValue,
  enabled = true,
}: UsePersistedStateOptions<T>): UsePersistedStateReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(enabled);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved !== null) {
          setValueState(JSON.parse(saved));
        }
      } catch (error) {
        logger.error('Failed to load persisted state', { key, error });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [key, enabled]);

  // Save to storage when value changes
  const setValue = useCallback(
    (newValue: T) => {
      setValueState(newValue);

      if (!enabled) return;

      try {
        void AsyncStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        logger.error('Failed to persist state', { key, error });
      }
    },
    [key, enabled],
  );

  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValueState(initialValue);
    } catch (error) {
      logger.error('Failed to clear persisted state', { key, error });
    }
  }, [key, initialValue]);

  return {
    value,
    setValue,
    isLoading,
    clearStorage,
  };
}
