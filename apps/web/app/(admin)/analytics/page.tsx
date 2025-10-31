'use client';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedDropdown,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

const formatPercent = (num: number): string => {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
};

const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { analytics, isLoading, fetchAnalytics, setDateRange: setHookDateRange } = useAdminAnalytics();

  const loadAnalytics = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // fetchAnalytics updates state internally, returns void
      if (fetchAnalytics) {
        await fetchAnalytics();
        return;
      }

    } catch (error: unknown) {
      logger.error('Error loading analytics:', { error });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setHookDateRange(dateRange);
    void loadAnalytics();
  }, [dateRange]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadAnalytics();
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={6}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <EnhancedDropdown
            value={dateRange}
            onChange={(value) => setDateRange(value as '7d' | '30d' | '90d' | '1y')}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
          />
          <EnhancedButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="primary"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </EnhancedButton>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <EnhancedCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.users.total.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={getTrendColor(analytics.users.trend)}>
                      {getTrendIcon(analytics.users.trend)} {formatPercent(analytics.users.growth)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {analytics.users.active.toLocaleString()} active
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Matches</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.matches.total.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={getTrendColor(analytics.matches.trend)}>
                      {getTrendIcon(analytics.matches.trend)} {formatPercent(analytics.matches.growth)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {analytics.matches.active.toLocaleString()} active
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-pink-100 dark:bg-pink-900 p-3">
                  <ChartBarIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.messages.total.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={getTrendColor(analytics.messages.trend)}>
                      {getTrendIcon(analytics.messages.trend)} {formatPercent(analytics.messages.growth)}
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.revenue.totalRevenue)}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    MRR: {formatNumber(analytics.revenue.monthlyRecurringRevenue)}
                  </div>
                </div>
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                  <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* Engagement Metrics */}
          <EnhancedCard className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Engagement</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagement.dailyActiveUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagement.weeklyActiveUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagement.monthlyActiveUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Session Duration</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(analytics.engagement.averageSessionDuration / 60)}m
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagement.bounceRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.engagement.retentionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </EnhancedCard>

          {/* Revenue Metrics */}
          <EnhancedCard className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Revenue Analytics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ARPU</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.revenue.averageRevenuePerUser)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.revenue.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {analytics.revenue.churnRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">MRR</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.revenue.monthlyRecurringRevenue)}
                </p>
              </div>
            </div>
          </EnhancedCard>

          {/* Security Overview */}
          <EnhancedCard className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Security Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspicious Logins</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {analytics.security.suspiciousLogins}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blocked IPs</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.security.blockedIPs}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reported Content</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics.security.reportedContent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Banned Users</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {analytics.security.bannedUsers}
                </p>
              </div>
            </div>
          </EnhancedCard>
        </>
      )}
    </div>
  );
}

