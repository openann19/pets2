/**
 * useHomeScreen Hook
 * Manages HomeScreen state and business logic
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logger } from '@pawfectmatch/core';
import { authService } from '../../services/AuthService';
import type { RootStackParamList } from '../../navigation/types';
import { haptic } from '../../ui/haptics';
import { telemetry } from '../../lib/telemetry';
import { useDemoMode } from '../../demo/DemoModeProvider';
import type { HomeQuickActionEventPayload } from '../../constants/events';

import type { Stats, RecentActivityItem } from './types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();
  const { enabled: isDemoMode } = useDemoMode();

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
    telemetry.trackHomeOpen();
  }, []);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        // Load demo fixtures
        const { demoHomeStats, demoRecentActivity } = await import('../../demo/fixtures/home');
        setStats(demoHomeStats);
        setRecentActivity(demoRecentActivity);
        setIsLoading(false);
        return;
      }

      // Get access token from AuthService
      const accessToken = await authService.getAccessToken();

      // Fetch stats
      const apiUrl = process.env['EXPO_PUBLIC_API_URL'] || '';
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
        pets: 0,
      });

      // Fetch recent activity
      const activityResponse = await fetch(`${apiUrl}/home/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!activityResponse.ok) {
        throw new Error(`Failed to fetch activity: ${activityResponse.statusText}`);
      }

      const activityData = await activityResponse.json();

      // Transform to RecentActivityItem format
      const activities: RecentActivityItem[] = (activityData.activities || []).map((item: unknown) => {
        const activity = item as {
          id: string;
          type: 'match' | 'message';
          title: string;
          description: string;
          timestamp: string;
        };
        return {
          ...activity,
          timeAgo: formatTimeAgo(activity.timestamp),
        };
      });

      setRecentActivity(activities);
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to load home data:', { error: err });
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    telemetry.trackHomeRefresh();
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
        telemetry.trackHomeQuickAction({ action: action as HomeQuickActionEventPayload['action'] });
        switch (action) {
          case 'swipe':
            navigation.navigate('Swipe');
            break;
          case 'matches':
            navigation.navigate('Matches');
            break;
          case 'messages':
            navigation.navigate('Matches');
            break;
          case 'profile':
            navigation.navigate('Profile');
            break;
          case 'settings':
            navigation.navigate('Settings');
            break;
          case 'my-pets':
            navigation.navigate('MyPets');
            break;
          case 'create-pet':
            navigation.navigate('CreatePet');
            break;
          case 'community':
            navigation.navigate('Community');
            break;
          case 'premium':
            navigation.navigate('Premium');
            telemetry.trackPremiumCTAClick({ source: 'home_quick_action' });
            break;
          default:
            logger.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error('Navigation error:', { error });
      }
    },
    [navigation],
  );

  const handleProfilePress = useCallback(() => {
    haptic.tap();
    handleQuickAction('profile');
  }, [handleQuickAction]);

  const handleSettingsPress = useCallback(() => {
    haptic.tap();
    handleQuickAction('settings');
  }, [handleQuickAction]);

  const handleSwipePress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('swipe');
  }, [handleQuickAction]);

  const handleMatchesPress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('matches');
  }, [handleQuickAction]);

  const handleMessagesPress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('messages');
  }, [handleQuickAction]);

  const handleMyPetsPress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('my-pets');
  }, [handleQuickAction]);

  const handleCreatePetPress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('create-pet');
  }, [handleQuickAction]);

  const handleCommunityPress = useCallback(() => {
    haptic.confirm();
    handleQuickAction('community');
  }, [handleQuickAction]);

  const handlePremiumPress = useCallback(() => {
    haptic.confirm();
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
