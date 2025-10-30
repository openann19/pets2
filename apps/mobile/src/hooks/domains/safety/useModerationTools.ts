/**
 * useModerationTools Hook
 * Manages moderation tools and operations for content moderation
 */
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { moderationAPI } from '../../../services/api';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../navigation/types';
import { Linking } from 'react-native';

interface ModerationTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  badge?: string;
}

interface ModerationStats {
  pendingReports: number;
  reviewedToday: number;
  totalModerated: number;
  activeWarnings: number;
}

interface UseModerationToolsReturn {
  // Tools
  moderationTools: ModerationTool[];
  handleModerationTool: (tool: ModerationTool) => void;

  // Stats
  moderationStats: ModerationStats;
  isRefreshing: boolean;

  // Actions
  reviewReports: () => void;
  moderateContent: () => void;
  monitorMessages: () => void;
  manageUsers: () => void;
  viewAnalytics: () => void;
  configureSettings: () => void;
  refreshStats: () => Promise<void>;
}

interface UseModerationToolsOptions {
  navigation?: NavigationProp<RootStackParamList>;
}

export const useModerationTools = (options?: UseModerationToolsOptions): UseModerationToolsReturn => {
  const { navigation } = options || {};
  const [moderationStats, setModerationStats] = useState<ModerationStats>({
    pendingReports: 12,
    reviewedToday: 8,
    totalModerated: 156,
    activeWarnings: 3,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reviewReports = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminUploads');
        logger.info('Navigated to reports moderation');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to reports', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to reports screen.');
      }
    } else {
      Alert.alert('User Reports', 'Navigate to Admin Uploads screen for reports moderation.');
    }
  }, [navigation]);

  const moderateContent = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminUploads');
        logger.info('Navigated to content moderation');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to content moderation', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to content moderation.');
      }
    } else {
      Alert.alert('Content Moderation', 'Navigate to Admin Uploads screen for content moderation.');
    }
  }, [navigation]);

  const monitorMessages = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminChats');
        logger.info('Navigated to message monitoring');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to message monitoring', { error: errorObj });
      }
    } else {
      logger.info('Navigate to message monitoring');
    }
  }, [navigation]);

  const manageUsers = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminUsers');
        logger.info('Navigated to user management');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to user management', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to user management.');
      }
    } else {
      Alert.alert('User Management', 'Navigate to Admin Users screen for user management.');
    }
  }, [navigation]);

  const viewAnalytics = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminAnalytics');
        logger.info('Navigated to moderation analytics');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to analytics', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to analytics dashboard.');
      }
    } else {
      Alert.alert('Analytics', 'Navigate to Admin Analytics screen for moderation analytics.');
    }
  }, [navigation]);

  const configureSettings = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('AdminConfig');
        logger.info('Navigated to moderation settings');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to moderation settings', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to moderation settings.');
      }
    } else {
      Alert.alert('Settings', 'Navigate to Admin Config screen for moderation settings.');
    }
  }, [navigation]);

  const refreshStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const stats = await moderationAPI.getStats();
      setModerationStats({
        pendingReports: stats.pendingReports,
        reviewedToday: 8, // This would come from API if available
        totalModerated: 156, // This would come from API if available
        activeWarnings: 3, // This would come from API if available
      });
      logger.info('Moderation stats refreshed', { stats });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to refresh moderation stats', { error: errorObj });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleModerationTool = useCallback((tool: ModerationTool) => {
    tool.action();
  }, []);

  const moderationTools: ModerationTool[] = [
    {
      id: 'reports',
      title: 'User Reports',
      description: 'Review and moderate reported content',
      icon: 'flag-outline',
      color: '#EF4444',
      badge: moderationStats.pendingReports.toString(),
      action: reviewReports,
    },
    {
      id: 'content',
      title: 'Content Moderation',
      description: 'Review photos and profiles for violations',
      icon: 'images-outline',
      color: '#F59E0B',
      action: moderateContent,
    },
    {
      id: 'messages',
      title: 'Message Monitoring',
      description: 'Monitor chat messages for inappropriate content',
      icon: 'chatbubble-ellipses-outline',
      color: '#8B5CF6',
      action: monitorMessages,
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'people-outline',
      color: '#10B981',
      action: manageUsers,
    },
    {
      id: 'analytics',
      title: 'Moderation Analytics',
      description: 'View moderation statistics and reports',
      icon: 'bar-chart-outline',
      color: '#06B6D4',
      action: viewAnalytics,
    },
    {
      id: 'settings',
      title: 'Moderation Settings',
      description: 'Configure moderation rules and thresholds',
      icon: 'settings-outline',
      color: '#EC4899',
      action: configureSettings,
    },
  ];

  return {
    // Tools
    moderationTools,
    handleModerationTool,

    // Stats
    moderationStats,
    isRefreshing,

    // Actions
    reviewReports,
    moderateContent,
    monitorMessages,
    manageUsers,
    viewAnalytics,
    configureSettings,
    refreshStats,
  };
};
