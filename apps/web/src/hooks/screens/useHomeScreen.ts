/**
 * useHomeScreen Hook - Web Version
 * Manages HomeScreen state and business logic matching mobile exactly
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@/lib/auth-store';
import type { HomeQuickActionEventPayload } from '@/constants/events';

export interface Stats {
  matches: number;
  messages: number;
  pets: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'match' | 'message';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

interface UseHomeScreenReturn {
  stats: Stats;
  recentActivity: RecentActivityItem[];
  refreshing: boolean;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => Promise<void>;
  refetch: () => Promise<void>;
  handleQuickAction: (action: string) => void;
  handleProfilePress: () => void;
  handleSettingsPress: () => void;
  handleSwipePress: () => void;
  handleMatchesPress: () => void;
  handleMessagesPress: () => void;
  handleMyPetsPress: () => void;
  handleCreatePetPress: () => void;
  handleCommunityPress: () => void;
  handlePremiumPress: () => void;
}

/**
 * Format timestamp to relative time (e.g., "2m ago", "5m ago")
 */
function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const useHomeScreen = (): UseHomeScreenReturn => {
  const router = useRouter();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<Stats>({
    matches: 0,
    messages: 0,
    pets: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  // Load initial data
  useEffect(() => {
    void loadHomeData();
  }, []);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = localStorage.getItem('accessToken');

      // Fetch stats
      const statsResponse = await fetch(`${apiUrl}/home/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
      }

      const statsData = await statsResponse.json();

      setStats({
        matches: statsData.matches || 0,
        messages: statsData.messages || 0,
        pets: 0,
      });

      // Fetch recent activity
      const activityResponse = await fetch(`${apiUrl}/home/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!activityResponse.ok) {
        throw new Error(`Failed to fetch activity: ${activityResponse.statusText}`);
      }

      const activityData = await activityResponse.json();

      // Transform to RecentActivityItem format
      const activities: RecentActivityItem[] = (activityData.activities || []).map((item: any) => ({
        ...item,
        timeAgo: formatTimeAgo(item.timestamp),
      }));

      setRecentActivity(activities);
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to load home data:', { error: err });
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHomeData();
    } catch (error) {
      logger.error('Failed to refresh data:', { error });
    } finally {
      setRefreshing(false);
    }
  }, [loadHomeData]);

  const handleQuickAction = useCallback(
    (action: string) => {
      try {
        switch (action) {
          case 'swipe':
            router.push('/swipe');
            break;
          case 'matches':
            router.push('/matches');
            break;
          case 'messages':
            router.push('/matches');
            break;
          case 'profile':
            router.push('/profile');
            break;
          case 'settings':
            router.push('/settings');
            break;
          case 'my-pets':
            router.push('/my-pets');
            break;
          case 'create-pet':
            router.push('/pets/new');
            break;
          case 'community':
            router.push('/community');
            break;
          case 'premium':
            router.push('/premium');
            break;
          default:
            logger.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error('Navigation error:', { error });
      }
    },
    [router],
  );

  const handleProfilePress = useCallback(() => {
    handleQuickAction('profile');
  }, [handleQuickAction]);

  const handleSettingsPress = useCallback(() => {
    handleQuickAction('settings');
  }, [handleQuickAction]);

  const handleSwipePress = useCallback(() => {
    handleQuickAction('swipe');
  }, [handleQuickAction]);

  const handleMatchesPress = useCallback(() => {
    handleQuickAction('matches');
  }, [handleQuickAction]);

  const handleMessagesPress = useCallback(() => {
    handleQuickAction('messages');
  }, [handleQuickAction]);

  const handleMyPetsPress = useCallback(() => {
    handleQuickAction('my-pets');
  }, [handleQuickAction]);

  const handleCreatePetPress = useCallback(() => {
    handleQuickAction('create-pet');
  }, [handleQuickAction]);

  const handleCommunityPress = useCallback(() => {
    handleQuickAction('community');
  }, [handleQuickAction]);

  const handlePremiumPress = useCallback(() => {
    handleQuickAction('premium');
  }, [handleQuickAction]);

  return {
    stats,
    recentActivity,
    refreshing,
    isLoading,
    error,
    onRefresh,
    refetch: loadHomeData,
    handleQuickAction,
    handleProfilePress,
    handleSettingsPress,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleMyPetsPress,
    handleCreatePetPress,
    handleCommunityPress,
    handlePremiumPress,
  };
};

