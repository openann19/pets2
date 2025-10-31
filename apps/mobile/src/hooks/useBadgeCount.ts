/**
 * Hook for managing app badge count based on unread messages and matches
 * Integrates with notification service to update badge count
 */

import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationService } from '../services/notifications';
import { logger } from '@pawfectmatch/core';
import { api } from '../services/api';

interface BadgeCountData {
  unreadMessages: number;
  unreadMatches: number;
  total: number;
}

/**
 * Hook to manage badge count updates
 * Updates badge count based on unread messages and matches
 * Clears badge when app is opened
 */
export function useBadgeCount() {
  const updateBadgeCount = useCallback(async () => {
    try {
      // Get unread counts from API
      // Note: This should be replaced with actual API endpoint when available
      const stats = await api.get<{ messages: number; matches: number }>('/home/stats');
      
      const total = (stats.messages || 0) + (stats.matches || 0);
      
      // Update badge count
      await notificationService.setBadgeCount(total);
      
      logger.debug('Badge count updated', { unreadMessages: stats.messages, unreadMatches: stats.matches, total });
      
      return {
        unreadMessages: stats.messages || 0,
        unreadMatches: stats.matches || 0,
        total,
      };
    } catch (error) {
      logger.error('Failed to update badge count', { error });
      // Return zero counts on error
      await notificationService.setBadgeCount(0);
      return {
        unreadMessages: 0,
        unreadMatches: 0,
        total: 0,
      };
    }
  }, []);

  const clearBadge = useCallback(async () => {
    try {
      await notificationService.clearBadge();
      logger.debug('Badge cleared');
    } catch (error) {
      logger.error('Failed to clear badge', { error });
    }
  }, []);

  // Update badge count when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - update badge count
        updateBadgeCount().catch((error) => {
          logger.error('Failed to update badge on foreground', { error });
        });
      }
    });

    // Initial update
    updateBadgeCount().catch((error) => {
      logger.error('Failed to update badge on mount', { error });
    });

    return () => {
      subscription.remove();
    };
  }, [updateBadgeCount]);

  return {
    updateBadgeCount,
    clearBadge,
  };
}

