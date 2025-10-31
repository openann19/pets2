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
import { _adminAPI as adminAPI } from '../../services/adminAPI';

// API Response Types
interface BillingMetricsResponse {
  totalRevenue?: number;
  monthlyRecurringRevenue?: number;
  annualRecurringRevenue?: number;
  averageRevenuePerUser?: number;
  conversionRate?: number;
  churnRate?: number;
  activeSubscriptions?: number;
  revenueGrowth?: number;
}

interface DashboardMetrics {
  users: {
    total: number;
    recent24h: number;
  };
  pets: {
    total: number;
    recent24h: number;
  };
  matches: {
    total: number;
    recent24h: number;
  };
  systemHealth: number;
  revenue?: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
    activeSubscriptions: number;
    revenueGrowth: number;
  };
}

interface RecentActivity {
  title: string;
  time: string;
  color?: string;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color?: string;
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
  exportModalVisible: boolean;
  setExportModalVisible: (visible: boolean) => void;

  // Actions
  onRefresh: () => Promise<void>;
  onNavigateToUsers: () => void;
  onNavigateToChats: () => void;
  onNavigateToVerifications: () => void;
  onNavigateToUploads: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToBilling: () => void;
  onNavigateToServices: () => void;
  onNavigateToConfig: () => void;
  onQuickAction: (actionId: string) => void;
  exportData: (format: 'json' | 'csv' | 'pdf', timeRange?: string) => Promise<void>;
}

/**
 * Hook for admin dashboard screen
 * Provides comprehensive overview and navigation
 */
export function useAdminDashboardScreen({
  navigation,
}: UseAdminDashboardScreenParams): AdminDashboardScreenState {
  const { handleNetworkError } = useErrorHandler();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    users: { total: 0, recent24h: 0 },
    pets: { total: 0, recent24h: 0 },
    matches: { total: 0, recent24h: 0 },
    systemHealth: 100,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load dashboard data from API - replace mock data with real API calls
  const loadDashboardData = useCallback(async (options: { force?: boolean } = {}) => {
    try {
      if (options.force || metrics.users.total === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Call real API endpoints using analytics endpoint and billing metrics
      try {
        const [analyticsResponse, billingMetricsResponse] = await Promise.all([
          adminAPI.getAnalytics({ period: '24h' }),
          adminAPI.getBillingMetrics().catch((err) => {
            logger.warn('Billing metrics unavailable', { error: err });
            return { success: false, data: null };
          }),
        ]);
        
        if (analyticsResponse.success && analyticsResponse.data) {
          // Extract revenue metrics from billing response
          const revenueMetrics = billingMetricsResponse.success && billingMetricsResponse.data
            ? {
                totalRevenue: (billingMetricsResponse.data as BillingMetricsResponse).totalRevenue || 0,
                monthlyRecurringRevenue: (billingMetricsResponse.data as BillingMetricsResponse).monthlyRecurringRevenue || 0,
                annualRecurringRevenue: (billingMetricsResponse.data as BillingMetricsResponse).annualRecurringRevenue || 0,
                averageRevenuePerUser: (billingMetricsResponse.data as BillingMetricsResponse).averageRevenuePerUser || 0,
                conversionRate: (billingMetricsResponse.data as BillingMetricsResponse).conversionRate || 0,
                churnRate: (billingMetricsResponse.data as BillingMetricsResponse).churnRate || 0,
                activeSubscriptions: (billingMetricsResponse.data as BillingMetricsResponse).activeSubscriptions || 0,
                revenueGrowth: (billingMetricsResponse.data as BillingMetricsResponse).revenueGrowth || 0,
              }
            : undefined;

          const mappedMetrics: DashboardMetrics = {
            users: {
              total: analyticsResponse.data.users?.total || 0,
              recent24h: analyticsResponse.data.users?.recent24h || 0,
            },
            pets: {
              total: analyticsResponse.data.pets?.total || 0,
              recent24h: analyticsResponse.data.pets?.recent24h || 0,
            },
            matches: {
              total: analyticsResponse.data.matches?.total || 0,
              recent24h: analyticsResponse.data.matches?.recent24h || 0,
            },
            systemHealth: 100, // Would need dedicated health check endpoint
            ...(revenueMetrics ? { revenue: revenueMetrics } : {}),
          };

          // Map recent activity - in production, use GET /admin/dashboard/activity
          const mappedActivity: RecentActivity[] = [];

          setMetrics(mappedMetrics);
          setRecentActivity(mappedActivity);
          setLastUpdated(new Date());

          logger.info('Admin dashboard data loaded from API', {
            metrics: mappedMetrics,
            activityCount: mappedActivity.length,
            hasRevenueData: !!revenueMetrics,
          });
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        // If API endpoints don't exist yet, use fallback empty state
        logger.warn('Dashboard API endpoints not available, using fallback', { error });
        
        const fallbackMetrics: DashboardMetrics = {
          users: { total: 0, recent24h: 0 },
          pets: { total: 0, recent24h: 0 },
          matches: { total: 0, recent24h: 0 },
          systemHealth: 100,
        };

        setMetrics(fallbackMetrics);
        setRecentActivity([]);
        setLastUpdated(new Date());
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load dashboard data');
      logger.error('Failed to load admin dashboard data', { error: err });
      handleNetworkError(err, 'admin.dashboard.load');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [metrics.users.total, handleNetworkError]);

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

  const onNavigateToServices = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminServices');
  }, [navigation]);

  const onNavigateToConfig = useCallback(() => {
    try {
      const Haptics = require('expo-haptics');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // No-op if haptics not available
    }
    navigation.navigate('AdminConfig');
  }, [navigation]);

  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Export data function
  const exportData = useCallback(
    async (format: 'json' | 'csv' | 'pdf' = 'json', timeRange: string = '30d') => {
      try {
        setIsRefreshing(true);
        setExportModalVisible(false);

        // Show loading alert
        Alert.alert(
          'Export Started',
          `Exporting data in ${format.toUpperCase()} format for ${timeRange}. This may take a moment.`,
        );

        // Call the admin API export endpoint
        const { _adminAPI } = await import('../../services/api');
        const response = await _adminAPI.exportAnalytics({
          format,
          timeRange,
        });

        if (response.success) {
          if (response.downloadUrl) {
            // Handle file download for CSV format
            const { FileDownloadService } = await import('../../services/fileDownloadService');

            try {
              // Generate filename with timestamp
              const fileName = `analytics-export-${format}-${new Date().toISOString().split('T')[0]}.${format}`;

              // Download the file
              await FileDownloadService.downloadFile(response.downloadUrl, {
                fileName,
                showProgress: true,
                autoShare: false,
                saveToDownloads: true,
              });

              logger.info('Data file downloaded successfully', { format, fileName, timeRange });
            } catch (downloadError) {
              logger.error('File download failed', { error: downloadError });
              Alert.alert(
                'Download Failed',
                'The export was generated but could not be downloaded. Please try again.',
              );
            }
          } else {
            // Handle JSON data response
            Alert.alert(
              'Export Complete',
              `Data exported successfully in ${format.toUpperCase()} format.`,
            );
          }

          logger.info('Data export completed', { format, timeRange, response });
        } else {
          throw new Error(response.error || response.message || 'Export failed');
        }
      } catch (error) {
        logger.error('Data export failed', { error });
        Alert.alert(
          'Export Failed',
          `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [],
  );

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'users',
      title: 'User Management',
      subtitle: `${metrics.users.total} total users`,
      icon: 'people-outline',
      color: '#3b82f6',
      action: () => {
        onNavigateToUsers();
      },
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'View detailed metrics',
      icon: 'analytics-outline',
      color: '#10b981',
      action: () => {
        onNavigateToAnalytics();
      },
    },
    {
      id: 'chats',
      title: 'Chat Moderation',
      subtitle: 'Monitor conversations',
      icon: 'chatbubble-outline',
      color: '#f59e0b',
      action: () => {
        onNavigateToChats();
      },
    },
    {
      id: 'uploads',
      title: 'Media Uploads',
      subtitle: 'Manage user content',
      icon: 'cloud-upload-outline',
      color: '#8b5cf6',
      action: () => {
        onNavigateToUploads();
      },
    },
    {
      id: 'verifications',
      title: 'Verifications',
      subtitle: 'Review pet verifications',
      icon: 'checkmark-circle-outline',
      color: '#06b6d4',
      action: () => {
        onNavigateToVerifications();
      },
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Monitor threats',
      icon: 'shield-outline',
      color: '#ef4444',
      action: () => {
        onNavigateToSecurity();
      },
    },
    {
      id: 'billing',
      title: 'Billing',
      subtitle: 'Manage subscriptions',
      icon: 'cash-outline',
      color: '#22c55e',
      action: () => {
        onNavigateToBilling();
      },
    },
    {
      id: 'services',
      title: 'Services',
      subtitle: 'Manage integrations',
      icon: 'server-outline',
      color: '#6366f1',
      action: () => {
        onNavigateToServices();
      },
    },
    {
      id: 'config',
      title: 'API Config',
      subtitle: 'Configure services',
      icon: 'settings-outline',
      color: '#64748b',
      action: () => {
        onNavigateToConfig();
      },
    },
    {
      id: 'export_data',
      title: 'Export Data',
      subtitle: 'Download system reports',
      icon: 'download-outline',
      color: '#f97316',
      action: () => {
        setExportModalVisible(true);
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
    exportModalVisible,
    setExportModalVisible,

    // Actions
    onRefresh,
    onNavigateToUsers,
    onNavigateToChats,
    onNavigateToVerifications,
    onNavigateToUploads,
    onNavigateToAnalytics,
    onNavigateToSecurity,
    onNavigateToBilling,
    onNavigateToServices,
    onNavigateToConfig,
    onQuickAction,
    exportData,
  };
}

export default useAdminDashboardScreen;
