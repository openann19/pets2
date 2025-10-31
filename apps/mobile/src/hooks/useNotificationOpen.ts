/**
 * 🎯 HOOKS: NOTIFICATION OPEN HANDLER
 * 
 * Hook to handle push notification opens and show backdrop blur
 * Integrates with expo-notifications
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useOverlayState } from '@/foundation/overlay/overlayState';
import { logger } from '@pawfectmatch/core';

/**
 * Hook to handle notification opens and show backdrop blur
 * 
 * Shows backdrop for 1-2 seconds after notification opens, or until in-app banner is dismissed
 * 
 * @example
 * ```tsx
 * function Navigation() {
 *   useNotificationOpen();
 *   // ...
 * }
 * ```
 */
export function useNotificationOpen(): void {
  const { show, hide } = useOverlayState();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Handle notification opened from background/killed state
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      logger.info('Notification opened', { notification: response.notification });

      // Show backdrop when notification opens
      show('notification');

      // Hide backdrop after 1.2 seconds (or when in-app banner is dismissed)
      // Adjust timing as needed based on your in-app notification banner duration
      timeoutId = setTimeout(() => {
        hide('notification');
      }, 1200);
    });

    // Also handle initial notification (if app was opened from a notification)
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          logger.info('App opened from notification', { notification: response.notification });
          
          // Show backdrop for initial notification
          show('notification');
          
          // Hide backdrop after 1.2 seconds
          timeoutId = setTimeout(() => {
            hide('notification');
          }, 1200);
        }
      })
      .catch((error) => {
        // Non-critical error
        logger.debug('Failed to get last notification response', { error });
      });

    // Cleanup
    return () => {
      subscription.remove();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [show, hide]);
}

