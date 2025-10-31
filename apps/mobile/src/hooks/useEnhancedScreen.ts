/**
 * useEnhancedScreen Hook
 * 
 * Comprehensive hook that provides accessibility, performance, loading states,
 * and UX enhancements for all screens.
 * 
 * Features:
 * - Accessibility labels and roles
 * - Loading state management
 * - Error handling
 * - Performance optimizations (memoization)
 * - Screen reader announcements
 * - Reduce motion support
 */

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useAccessibility } from './useAccessibility';
import { useStableCallback, useMemoCompare } from './usePerformance';
import { announceContextChange } from '@/foundation/accessibility';

export interface UseEnhancedScreenOptions {
  /**
   * Screen name for accessibility labels
   */
  screenName: string;

  /**
   * Whether the screen is currently loading
   */
  isLoading?: boolean;

  /**
   * Error object if screen has an error
   */
  error?: Error | { message: string; userMessage?: string } | null;

  /**
   * Whether the screen is offline
   */
  isOffline?: boolean;

  /**
   * Whether to announce state changes to screen readers
   */
  announceChanges?: boolean;

  /**
   * Initial loading message
   */
  loadingMessage?: string;

  /**
   * Custom accessibility overrides
   */
  accessibilityOverrides?: {
    label?: string;
    hint?: string;
    role?: string;
  };
}

export interface UseEnhancedScreenReturn {
  /**
   * Accessibility utilities
   */
  a11y: {
    labels: Record<string, { label: string; hint?: string; role?: string }>;
    actions: Record<string, { label: string; hint?: string; role?: string }>;
    generateListItemLabel: (
      itemType: string,
      itemName: string,
      position?: number,
      total?: number,
    ) => string;
    generateProgressLabel: (currentStep: number, totalSteps: number, stepName?: string) => string;
    isScreenReaderEnabled: boolean;
    isReduceMotionEnabled: boolean;
    isHighContrastEnabled: boolean;
    getAccessibilityProps: (elementType: string, customLabel?: string) => {
      accessibilityLabel: string;
      accessibilityRole: string;
      accessibilityHint?: string;
    };
  };

  /**
   * Loading state utilities
   */
  loading: {
    isLoading: boolean;
    message: string;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
  };

  /**
   * Error state utilities
   */
  error: {
    hasError: boolean;
    errorMessage: string | null;
    userMessage: string | null;
    clearError: () => void;
  };

  /**
   * Performance utilities
   */
  performance: {
    memoizeCallback: <T extends (...args: never[]) => unknown>(
      callback: T,
      deps: React.DependencyList,
    ) => T;
    memoizeValue: <T>(value: T, compareFn?: (prev: T | undefined, next: T) => boolean) => T;
  };

  /**
   * Network state utilities
   */
  network: {
    isOffline: boolean;
    showOfflineMessage: boolean;
  };

  /**
   * Screen announcement utilities
   */
  announcements: {
    announce: (message: string) => void;
    announceLoading: (message?: string) => void;
    announceError: (message: string) => void;
    announceSuccess: (message: string) => void;
  };
}

/**
 * Enhanced screen hook with comprehensive accessibility, performance, and UX features
 */
export function useEnhancedScreen(
  options: UseEnhancedScreenOptions,
): UseEnhancedScreenReturn {
  const {
    screenName,
    isLoading: externalLoading = false,
    error: externalError = null,
    isOffline: externalOffline = false,
    announceChanges = true,
    loadingMessage = 'Loading...',
    accessibilityOverrides: _accessibilityOverrides,
  } = options;

  // Accessibility hook
  const accessibility = useAccessibility();

  // Internal loading state
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalLoadingMessage, setInternalLoadingMessage] = useState(loadingMessage);
  const isLoading = externalLoading || internalLoading;

  // Error state
  const errorRef = useRef<Error | { message: string; userMessage?: string } | null>(externalError);
  const [errorState, setErrorState] = useState(externalError);

  // Sync external error
  useEffect(() => {
    if (externalError !== errorRef.current) {
      errorRef.current = externalError;
      setErrorState(externalError);
      if (externalError && announceChanges && accessibility.isScreenReaderEnabled) {
        const errorMsg =
          (!(externalError instanceof Error) && externalError.userMessage) ||
          externalError.message ||
          'An error occurred';
        announceContextChange(errorMsg);
      }
    }
  }, [externalError, announceChanges, accessibility.isScreenReaderEnabled]);

  // Screen labels from accessibility service
  const screenLabels = useMemo(() => {
    return accessibility.getScreenLabels(screenName);
  }, [accessibility, screenName]);

  // Action labels
  const actionLabels = useMemo(() => {
    return accessibility.getActionLabels();
  }, [accessibility]);

  // Loading management
  const showLoading = useCallback((message?: string) => {
    setInternalLoading(true);
    if (message) {
      setInternalLoadingMessage(message);
    }
  }, []);

  const hideLoading = useCallback(() => {
    setInternalLoading(false);
    setInternalLoadingMessage(loadingMessage);
  }, [loadingMessage]);

  // Error management
  const clearError = useCallback(() => {
    setErrorState(null);
    errorRef.current = null;
  }, []);

  // Performance utilities
  const memoizeCallback = useCallback(
    <T extends (...args: never[]) => unknown>(callback: T, deps: React.DependencyList): T => {
      return useStableCallback(callback, deps);
    },
    [],
  );

  const memoizeValue = useCallback(
    <T>(value: T, compareFn?: (prev: T | undefined, next: T) => boolean): T => {
      if (compareFn) {
        return useMemoCompare(value, compareFn);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(() => value, [JSON.stringify(value)]);
    },
    [],
  );

  // Accessibility props generator
  const getAccessibilityProps = useCallback(
    (elementType: string, customLabel?: string) => {
      const roleMap: Record<string, string> = {
        button: 'button',
        link: 'link',
        text: 'text',
        image: 'image',
        header: 'header',
        list: 'list',
        listitem: 'button',
        search: 'search',
      };

      const labelKey = customLabel || elementType;
      const screenLabel = screenLabels[labelKey] || actionLabels[labelKey];
      const defaultLabel = customLabel || `${elementType} ${screenName}`;

      const role = screenLabel?.role || roleMap[elementType] || 'none';
      const hint = screenLabel?.hint;
      return {
        accessibilityLabel: screenLabel?.label || defaultLabel,
        accessibilityRole: role,
        ...(hint && { accessibilityHint: hint }),
      };
    },
    [screenLabels, actionLabels, screenName],
  );

  // Announcement utilities
  const announce = useCallback(
    (message: string) => {
      if (announceChanges && accessibility.isScreenReaderEnabled) {
        announceContextChange(message);
      }
    },
    [announceChanges, accessibility.isScreenReaderEnabled],
  );

  const announceLoading = useCallback(
    (message?: string) => {
      announce(message || loadingMessage);
    },
    [announce, loadingMessage],
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`);
    },
    [announce],
  );

  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Success: ${message}`);
    },
    [announce],
  );

  // Announce loading state changes
  useEffect(() => {
    if (isLoading && announceChanges && accessibility.isScreenReaderEnabled) {
      announceLoading(internalLoadingMessage);
    }
  }, [isLoading, announceChanges, accessibility.isScreenReaderEnabled, internalLoadingMessage, announceLoading]);

  // Compute error messages
  const errorMessage = useMemo(() => {
    if (!errorState) return null;
    return errorState instanceof Error ? errorState.message : errorState.message;
  }, [errorState]);

  const userMessage = useMemo(() => {
    if (!errorState) return null;
    if (errorState instanceof Error) return null;
    return errorState.userMessage || errorState.message;
  }, [errorState]);

  return {
    a11y: {
      labels: screenLabels,
      actions: actionLabels,
      generateListItemLabel: accessibility.generateListItemLabel,
      generateProgressLabel: accessibility.generateProgressLabel,
      isScreenReaderEnabled: accessibility.isScreenReaderEnabled,
      isReduceMotionEnabled: accessibility.isReduceMotionEnabled,
      isHighContrastEnabled: accessibility.isHighContrastEnabled,
      getAccessibilityProps,
    },
    loading: {
      isLoading,
      message: internalLoadingMessage,
      showLoading,
      hideLoading,
    },
    error: {
      hasError: !!errorState,
      errorMessage,
      userMessage,
      clearError,
    },
    performance: {
      memoizeCallback,
      memoizeValue,
    },
    network: {
      isOffline: externalOffline,
      showOfflineMessage: externalOffline,
    },
    announcements: {
      announce,
      announceLoading,
      announceError,
      announceSuccess,
    },
  };
}

export default useEnhancedScreen;

