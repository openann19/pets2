import { logger, useAuthStore } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

import { _adminAPI as adminAPI } from '../../../../services/api';
import type {
  ConversionFunnelData,
  CohortRetentionData,
} from '../components';

// API Response Types
interface AnalyticsAPIResponse {
  users?: {
    total?: number;
    active?: number;
    suspended?: number;
    banned?: number;
    verified?: number;
    recent24h?: number;
    growth?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  pets?: {
    total?: number;
    active?: number;
    recent24h?: number;
    growth?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  matches?: {
    total?: number;
    active?: number;
    blocked?: number;
    recent24h?: number;
    growth?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  messages?: {
    total?: number;
    deleted?: number;
    recent24h?: number;
    growth?: number;
    trend?: 'up' | 'down' | 'stable';
  };
  conversionFunnel?: ConversionFunnelData;
  retention?: CohortRetentionData;
}

export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
  };
  topPerformers: {
    users: {
      id: string;
      name: string;
      matches: number;
      messages: number;
    }[];
    pets: {
      id: string;
      name: string;
      breed: string;
      likes: number;
      matches: number;
    }[];
  };
  security: {
    suspiciousLogins: number;
    blockedIPs: number;
    reportedContent: number;
    bannedUsers: number;
  };
  conversionFunnel?: ConversionFunnelData;
  retention?: CohortRetentionData;
}

export const useAdminAnalytics = () => {
  const { user: _user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    void loadAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadAnalyticsData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch analytics, conversion funnel, and retention data in parallel
      const [analyticsResponse, funnelResponse, retentionResponse] = await Promise.all([
        adminAPI.getAnalytics({ period: selectedPeriod }),
        adminAPI.getConversionFunnel({ timeRange: selectedPeriod.replace('d', '') }).catch(() => ({ success: false, data: null })),
        adminAPI.getCohortRetention({ cohorts: '6' }).catch(() => ({ success: false, data: null }))
      ]);

      const responseData = analyticsResponse.data as AnalyticsAPIResponse || {};
      const fullData: AnalyticsData = {
        users: {
          total: responseData.users?.total || 0,
          active: responseData.users?.active || 0,
          suspended: responseData.users?.suspended || 0,
          banned: responseData.users?.banned || 0,
          verified: responseData.users?.verified || 0,
          recent24h: responseData.users?.recent24h || 0,
          growth: responseData.users?.growth || 0,
          trend: responseData.users?.trend || 'stable',
        },
        pets: {
          total: responseData.pets?.total || 0,
          active: responseData.pets?.active || 0,
          recent24h: responseData.pets?.recent24h || 0,
          growth: responseData.pets?.growth || 0,
          trend: responseData.pets?.trend || 'stable',
        },
        matches: {
          total: responseData.matches?.total || 0,
          active: responseData.matches?.active || 0,
          blocked: responseData.matches?.blocked || 0,
          recent24h: responseData.matches?.recent24h || 0,
          growth: responseData.matches?.growth || 0,
          trend: responseData.matches?.trend || 'stable',
        },
        messages: {
          total: responseData.messages?.total || 0,
          deleted: responseData.messages?.deleted || 0,
          recent24h: responseData.messages?.recent24h || 0,
          growth: responseData.messages?.growth || 0,
          trend: responseData.messages?.trend || 'stable',
        },
        engagement: {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          retentionRate: 0,
        },
        revenue: {
          totalRevenue: 0,
          monthlyRecurringRevenue: 0,
          averageRevenuePerUser: 0,
          conversionRate: 0,
          churnRate: 0,
        },
        topPerformers: {
          users: [],
          pets: [],
        },
        security: {
          suspiciousLogins: 0,
          blockedIPs: 0,
          reportedContent: 0,
          bannedUsers: 0,
        },
        ...(funnelResponse.success && funnelResponse.data
          ? {
              conversionFunnel: {
                totalFreeUsers: funnelResponse.data.totalFreeUsers || 0,
                paywallViews: funnelResponse.data.paywallViews || 0,
                premiumSubscribers: funnelResponse.data.premiumSubscribers || 0,
                ultimateSubscribers: funnelResponse.data.ultimateSubscribers || 0,
                freeToPaywallConversion:
                  funnelResponse.data.freeToPaywallConversion || 0,
                paywallToPremiumConversion:
                  funnelResponse.data.paywallToPremiumConversion || 0,
                premiumToUltimateConversion:
                  funnelResponse.data.premiumToUltimateConversion || 0,
                overallConversionRate: funnelResponse.data.overallConversionRate || 0,
              },
            }
          : responseData.conversionFunnel
            ? {
                conversionFunnel: {
                  totalFreeUsers: responseData.conversionFunnel.totalFreeUsers || 0,
                  paywallViews: responseData.conversionFunnel.paywallViews || 0,
                  premiumSubscribers: responseData.conversionFunnel.premiumSubscribers || 0,
                  ultimateSubscribers: responseData.conversionFunnel.ultimateSubscribers || 0,
                  freeToPaywallConversion:
                    responseData.conversionFunnel.freeToPaywallConversion || 0,
                  paywallToPremiumConversion:
                    responseData.conversionFunnel.paywallToPremiumConversion || 0,
                  premiumToUltimateConversion:
                    responseData.conversionFunnel.premiumToUltimateConversion || 0,
                  overallConversionRate: responseData.conversionFunnel.overallConversionRate || 0,
                },
              }
            : {}),
        ...(retentionResponse.success && retentionResponse.data
          ? {
              retention: {
                cohorts: retentionResponse.data.cohorts || [],
                averageRetention: retentionResponse.data.averageRetention || {
                  week1: 0,
                  week2: 0,
                  week4: 0,
                  month2: 0,
                  month3: 0,
                  month6: 0,
                  month12: 0,
                },
                latestCohortSize: retentionResponse.data.latestCohortSize || 0,
              },
            }
          : responseData.retention
            ? {
                retention: {
                  cohorts: responseData.retention.cohorts || [],
                  averageRetention: responseData.retention.averageRetention || {
                    week1: 0,
                    week2: 0,
                    week4: 0,
                    month2: 0,
                    month3: 0,
                    month6: 0,
                    month12: 0,
                  },
                  latestCohortSize: responseData.retention.latestCohortSize || 0,
                },
              }
            : {}),
      };
      setAnalytics(fullData);
    } catch (error: unknown) {
      logger.error('Error loading analytics data:', { error });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handlePeriodChange = (period: '7d' | '30d' | '90d'): void => {
    setSelectedPeriod(period);
  };

  return {
    analytics,
    loading,
    refreshing,
    selectedPeriod,
    onRefresh,
    handlePeriodChange,
  };
};
