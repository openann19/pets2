/**
 * Tab State Preservation Hook
 * 
 * Preserves and restores scroll positions, filter states, and other tab-specific state
 * when switching between tabs. Prevents loss of context when navigating.
 * 
 * Features:
 * - Scroll position preservation
 * - Filter state preservation
 * - Form input preservation
 * - Custom state preservation
 * - Automatic cleanup
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';

const TAB_STATE_STORAGE_PREFIX = 'tab_state_';

export interface TabState {
  scrollOffset?: number;
  filters?: Record<string, unknown>;
  formData?: Record<string, unknown>;
  selectedIndex?: number;
  customState?: Record<string, unknown>;
}

export interface UseTabStatePreservationOptions {
  tabName: string;
  scrollRef?: React.RefObject<{ scrollToOffset?: (offset: number) => void }>;
  preserveScroll?: boolean;
  preserveFilters?: boolean;
  preserveFormData?: boolean;
  customStateKeys?: string[];
  onStateRestored?: (state: TabState) => void;
}

export interface UseTabStatePreservationReturn {
  saveState: (state: Partial<TabState>) => Promise<void>;
  restoreState: () => Promise<TabState | null>;
  clearState: () => Promise<void>;
  updateScrollOffset: (offset: number) => void;
  updateFilters: (filters: Record<string, unknown>) => void;
  updateFormData: (formData: Record<string, unknown>) => void;
  updateCustomState: (key: string, value: unknown) => void;
}

/**
 * Hook for preserving tab state across navigation
 */
export function useTabStatePreservation({
  tabName,
  scrollRef,
  preserveScroll = true,
  preserveFilters = true,
  preserveFormData = false,
  customStateKeys = [],
  onStateRestored,
}: UseTabStatePreservationOptions): UseTabStatePreservationReturn {
  const storageKey = `${TAB_STATE_STORAGE_PREFIX}${tabName}`;
  const currentStateRef = useRef<TabState>({});
  const isRestoringRef = useRef(false);

  /**
   * Save state to AsyncStorage
   */
  const saveState = useCallback(
    async (state: Partial<TabState>) => {
      try {
        const updatedState: TabState = {
          ...currentStateRef.current,
          ...state,
        };

        currentStateRef.current = updatedState;

        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedState));
      } catch (error) {
        logger.error('Failed to save tab state', {
          tabName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [storageKey, tabName]
  );

  /**
   * Restore state from AsyncStorage
   */
  const restoreState = useCallback(async (): Promise<TabState | null> => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) return null;

      const state = JSON.parse(stored) as TabState;
      currentStateRef.current = state;

      // Restore scroll position
      if (preserveScroll && state.scrollOffset !== undefined && scrollRef?.current) {
        isRestoringRef.current = true;
        // Use setTimeout to ensure component is mounted
        setTimeout(() => {
          if (scrollRef.current?.scrollToOffset) {
            scrollRef.current.scrollToOffset(state.scrollOffset!);
          }
          isRestoringRef.current = false;
        }, 100);
      }

      onStateRestored?.(state);
      return state;
    } catch (error) {
      logger.error('Failed to restore tab state', {
        tabName,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }, [storageKey, tabName, preserveScroll, scrollRef, onStateRestored]);

  /**
   * Clear saved state
   */
  const clearState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      currentStateRef.current = {};
    } catch (error) {
      logger.error('Failed to clear tab state', {
        tabName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [storageKey, tabName]);

  /**
   * Update scroll offset
   */
  const updateScrollOffset = useCallback(
    (offset: number) => {
      if (preserveScroll && !isRestoringRef.current) {
        saveState({ scrollOffset: offset });
      }
    },
    [preserveScroll, saveState]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback(
    (filters: Record<string, unknown>) => {
      if (preserveFilters) {
        saveState({ filters });
      }
    },
    [preserveFilters, saveState]
  );

  /**
   * Update form data
   */
  const updateFormData = useCallback(
    (formData: Record<string, unknown>) => {
      if (preserveFormData) {
        saveState({ formData });
      }
    },
    [preserveFormData, saveState]
  );

  /**
   * Update custom state
   */
  const updateCustomState = useCallback(
    (key: string, value: unknown) => {
      if (customStateKeys.includes(key)) {
        const customState = {
          ...currentStateRef.current.customState,
          [key]: value,
        };
        saveState({ customState });
      }
    },
    [customStateKeys, saveState]
  );

  // Restore state when tab gains focus
  useFocusEffect(
    useCallback(() => {
      restoreState();
    }, [restoreState])
  );

  // Save state when tab loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Save current state before leaving tab
        if (Object.keys(currentStateRef.current).length > 0) {
          saveState({});
        }
      };
    }, [saveState])
  );

  return {
    saveState,
    restoreState,
    clearState,
    updateScrollOffset,
    updateFilters,
    updateFormData,
    updateCustomState,
  };
}

/**
 * Hook for preserving scroll position in FlatList/ScrollView
 */
export function useScrollPositionPreservation(
  tabName: string,
  scrollRef?: React.RefObject<{ scrollToOffset?: (offset: number) => void }>
) {
  const { updateScrollOffset, restoreState } = useTabStatePreservation({
    tabName,
    scrollRef,
    preserveScroll: true,
  });

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offset = event.nativeEvent.contentOffset.y;
      updateScrollOffset(offset);
    },
    [updateScrollOffset]
  );

  return {
    handleScroll,
    restoreState,
  };
}

