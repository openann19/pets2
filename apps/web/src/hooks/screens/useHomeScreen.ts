/**
 * useHomeScreen Hook - WEB VERSION
 * Manages HomeScreen state and business logic
 * Adapted from mobile version for web navigation
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@pawfectmatch/core';
import type { Stats, RecentActivityItem } from './types';

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

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export const useHomeScreen = (): UseHomeScreenReturn => {
  const navigate = useNavigate();
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
      // Get access token from auth store (if available)
      const accessToken = (user as any)?.accessToken || (user as any)?.token;

      // TODO: Replace with actual API endpoint
      const apiUrl = process.env.REACT_APP_API_URL || '';

      // Fetch stats
      if (apiUrl) {
        const statsResponse = await fetch(`${apiUrl}/home/stats`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
          pets: statsData.pets || 0,
        });

        // Fetch recent activity
        const activityResponse = await fetch(`${apiUrl}/home/recent-activity`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(
            (activityData.items || []).map((item: any) => ({
              ...item,
              timeAgo: formatTimeAgo(item.timestamp || new Date().toISOString()),
            }))
          );
        }
      } else {
        // Mock data for development
        setStats({
          matches: 5,
          messages: 12,
          pets: 2,
        });
        setRecentActivity([
          {
            id: '1',
            type: 'match',
            title: 'New match!',
            message: 'You matched with Luna',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            timeAgo: '1h ago',
          },
          {
            id: '2',
            type: 'message',
            title: 'New message',
            message: 'Charlie sent you a message',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            timeAgo: '2h ago',
          },
        ]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load home data');
      setError(error);
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHomeData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadHomeData]);

  const handleQuickAction = useCallback(
    (action: string) => {
      try {
        switch (action) {
          case 'swipe':
            navigate('/swipe');
            break;
          case 'matches':
            navigate('/matches');
            break;
          case 'messages':
            navigate('/matches');
            break;
          case 'profile':
            navigate('/profile');
            break;
          case 'settings':
            navigate('/settings');
            break;
          case 'my-pets':
            navigate('/my-pets');
            break;
          case 'create-pet':
            navigate('/create-pet');
            break;
          case 'community':
            navigate('/community');
            break;
          case 'premium':
            navigate('/premium');
            break;
          default:
            console.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    },
    [navigate],
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
