/**
 * Admin Dashboard Screen Hook
 * Provides analytics, metrics, and quick actions for admin overview
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import type { AdminScreenProps } from '../../navigation/types';
import { useErrorHandler } from '../useErrorHandler';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPets: number;
  totalMatches: number;
  pendingVerifications: number;
  reportedContent: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_joined' | 'pet_created' | 'match_made' | 'report_filed' | 'verification_submitted';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
}

interface UseAdminDashboardScreenParams {
  navigation: AdminScreenProps<'AdminDashboard'>['navigation'];
}

export interface AdminDashboardScreenState {
  // Data
  metrics: DashboardMetrics;
  recentActivity: RecentActivity[];
  quickActions: QuickAction[];

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;

  // Actions
  onRefresh: () => Promise<void>;
  onNavigateToUsers: () => void;
  onNavigateToChats: () => void;
  onNavigateToVerifications: () => void;
  onNavigateToUploads: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToBilling: () => void;
  onQuickAction: (actionId: string) => void;
}

/**
 * Hook for admin dashboard screen
 * Provides comprehensive overview and navigation
 */
export function useAdminDashboardScreen({
  navigation,
}: UseAdminDashboardScreenParams): AdminDashboardScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalPets: 0,
    totalMatches: 0,
    pendingVerifications: 0,
    reportedContent: 0,
    systemHealth: 'healthy',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock data loading - in real app, this would call admin APIs
  const loadDashboardData = useCallback(async (options: { force?: boolean } = {}) => {
    try {
      if (options.force || metrics.totalUsers === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Simulate API calls - small delay for tests
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Mock data - replace with real API calls
      const mockMetrics: DashboardMetrics = {
        totalUsers: 15420,
        activeUsers: 12890,
        totalPets: 8760,
        totalMatches: 45230,
        pendingVerifications: 23,
        reportedContent: 7,
        systemHealth: 'healthy',
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'verification_submitted',
          message: 'New pet verification submitted',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          priority: 'medium',
        },
        {
          id: '2',
          type: 'report_filed',
          message: 'Content report filed',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          priority: 'high',
        },
        {
          id: '3',
          type: 'user_joined',
          message: 'New user registered',
          timestamp: new Date(Date.now() - 18 * 60 * 1000),
          priority: 'low',
        },
        {
          id: '4',
          type: 'match_made',
          message: 'New match created',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          priority: 'low',
        },
      ];

      setMetrics(mockMetrics);
      setRecentActivity(mockActivity);
      setLastUpdated(new Date());

      logger.info('Admin dashboard data loaded', {
        metrics: mockMetrics,
        activityCount: mockActivity.length,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load dashboard');
      logger.error('Failed to load admin dashboard', { error: err });

      // Simplified error handling for tests
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData({ force: true });
  }, [loadDashboardData]);

  // Navigation handlers
  const onNavigateToUsers = useCallback(() => {
    // Simple haptic feedback - safely mocked in tests
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminUsers');
  }, [navigation]);

  const onNavigateToChats = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminChats');
  }, [navigation]);

  const onNavigateToVerifications = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminVerifications');
  }, [navigation]);

  const onNavigateToUploads = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminUploads');
  }, [navigation]);

  const onNavigateToAnalytics = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminAnalytics');
  }, [navigation]);

  const onNavigateToSecurity = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminSecurity');
  }, [navigation]);

  const onNavigateToBilling = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminBilling');
  }, [navigation]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'moderate_reports',
      title: 'Review Reports',
      subtitle: `${metrics.reportedContent} pending`,
      icon: 'flag',
      action: () => {
        Alert.alert('Moderate Reports', 'Navigate to reports moderation');
      },
      disabled: metrics.reportedContent === 0,
    },
    {
      id: 'verify_pets',
      title: 'Verify Pets',
      subtitle: `${metrics.pendingVerifications} pending`,
      icon: 'checkmark-circle',
      action: () => {
        onNavigateToVerifications();
      },
      disabled: metrics.pendingVerifications === 0,
    },
    {
      id: 'system_health',
      title: 'System Health',
      subtitle: metrics.systemHealth === 'healthy' ? 'All systems normal' : 'Check system status',
      icon: metrics.systemHealth === 'healthy' ? 'shield-checkmark' : 'warning',
      action: () => {
        Alert.alert('System Health', `Status: ${metrics.systemHealth.toUpperCase()}`);
      },
    },
    {
      id: 'export_data',
      title: 'Export Data',
      subtitle: 'Download system reports',
      icon: 'download',
      action: () => {
        Alert.alert('Export Data', 'Data export feature coming soon');
      },
    },
  ];

  const onQuickAction = useCallback(
    (actionId: string) => {
      const action = quickActions.find((a) => a.id === actionId);
      if (action && !action.disabled) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        action.action();
      }
    },
    [quickActions],
  );

  return {
    // Data
    metrics,
    recentActivity,
    quickActions,

    // UI State
    isLoading,
    isRefreshing,
    lastUpdated,

    // Actions
    onRefresh,
    onNavigateToUsers,
    onNavigateToChats,
    onNavigateToVerifications,
    onNavigateToUploads,
    onNavigateToAnalytics,
    onNavigateToSecurity,
    onNavigateToBilling,
    onQuickAction,
  };
}

export default useAdminDashboardScreen;
