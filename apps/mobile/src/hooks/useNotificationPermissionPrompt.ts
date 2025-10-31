/**
 * Hook to manage notification permission prompt visibility
 * Shows the prompt after onboarding or when user first opens certain screens
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService, type NotificationPermissionStatus } from '../services/notifications';
import { logger } from '@pawfectmatch/core';

const NOTIFICATION_PROMPT_SEEN_KEY = 'notification_permission_prompt_seen';
const NOTIFICATION_PROMPT_DISMISSED_KEY = 'notification_permission_prompt_dismissed';

interface UseNotificationPermissionPromptReturn {
  shouldShowPrompt: boolean;
  permissionStatus: NotificationPermissionStatus | null;
  dismissPrompt: () => Promise<void>;
  checkPermissionStatus: () => Promise<void>;
}

/**
 * Hook to manage when to show notification permission prompt
 * - Shows after onboarding completion
 * - Only shows if permission hasn't been requested before
 * - Remembers if user dismissed it
 * - Checks permission status
 */
export function useNotificationPermissionPrompt(
  autoCheck: boolean = true,
): UseNotificationPermissionPromptReturn {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);

  const checkPermissionStatus = async () => {
    try {
      const status = await notificationService.getPermissionStatus();

      // Don't show if already granted
      if (status.status === 'granted') {
        setShouldShowPrompt(false);
        setPermissionStatus(status);
        return;
      }

      // Don't show if permanently denied and user dismissed prompt before
      if (status.status === 'denied') {
        const wasDismissed = await AsyncStorage.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY);
        if (wasDismissed === 'true') {
          setShouldShowPrompt(false);
          setPermissionStatus(status);
          return;
        }
      }

      // Check if user has seen the prompt before
      const hasSeenPrompt = await AsyncStorage.getItem(NOTIFICATION_PROMPT_SEEN_KEY);

      // Show if:
      // 1. Permission is undetermined (never asked)
      // 2. Permission is denied but user hasn't dismissed our prompt
      // 3. User hasn't seen the prompt yet
      if (
        (status.status === 'undetermined' || (status.status === 'denied' && hasSeenPrompt === null)) &&
        hasSeenPrompt !== 'true'
      ) {
        setShouldShowPrompt(true);
      } else {
        setShouldShowPrompt(false);
      }

      setPermissionStatus(status);
    } catch (error) {
      logger.error('Failed to check notification permission status', { error });
      setShouldShowPrompt(false);
    }
  };

  const dismissPrompt = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PROMPT_SEEN_KEY, 'true');
      await AsyncStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, 'true');
      setShouldShowPrompt(false);
    } catch (error) {
      logger.error('Failed to dismiss notification prompt', { error });
    }
  };

  useEffect(() => {
    if (autoCheck) {
      void checkPermissionStatus();
    }
  }, [autoCheck]);

  return {
    shouldShowPrompt,
    permissionStatus,
    dismissPrompt,
    checkPermissionStatus,
  };
}

/**
 * Helper to mark notification prompt as seen (after onboarding completion)
 */
export async function markNotificationPromptAsAvailable(): Promise<void> {
  try {
    // Clear the dismissed flag so prompt can show again if needed
    await AsyncStorage.removeItem(NOTIFICATION_PROMPT_DISMISSED_KEY);
    // Keep the seen flag so we know user completed onboarding
    // But we'll still show it if permission wasn't granted
  } catch (error) {
    logger.error('Failed to mark notification prompt as available', { error });
  }
}

