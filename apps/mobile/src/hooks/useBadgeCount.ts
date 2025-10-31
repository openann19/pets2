/**
 * Hook for managing badge counts across the app
 * Integrates with notification service and navigation
 */

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { notificationService } from '../services/notifications';

/**
 * Manages badge count updates based on notification state
 * Updates app icon badge when app state changes
 */
export function useBadgeCount(): void {
  useEffect(() => {
    const updateBadgeCount = async (): Promise<void> => {
      try {
        const count = await notificationService.getUnreadCount();
        await notificationService.updateBadgeCount(count);
      } catch (error) {
        // Non-critical - badge updates may fail on some platforms
        console.warn('Failed to update badge count:', error);
      }
    };

    // Update badge count on mount
    updateBadgeCount();

    // Update badge count when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateBadgeCount();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
