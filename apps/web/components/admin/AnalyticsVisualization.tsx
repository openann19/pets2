'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';
import {
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface AnalyticsData {
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
  timeSeries: Array<{
    date: string;
    users: number;
    pets: number;
    matches: number;
    messages: number;
    revenue: number;
    engagement: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    type: 'user' | 'pet';
    score: number;
    metric: string;
  }>;
  geographicData: Array<{
    country: string;
    users: number;
    revenue: number;
    growth: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  securityMetrics: {
    totalAlerts: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    averageResponseTime: number;
  };
}

interface AnalyticsVisualizationProps {
  data: AnalyticsData;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'json') => void;
}

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  indigo: '#6366F1',
  pink: '#EC4899',
  gray: '#6B7280',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.info,
  COLORS.purple,
  COLORS.blue,
];

export default function AnalyticsVisualization({
  data,
  isLoading = false,
  onRefresh,
  onExport,
}: AnalyticsVisualizationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<
    'users' | 'pets' | 'matches' | 'messages' | 'revenue'
  >('users');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'composed'>('line');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => { clearInterval(interval); };
  }, [autoRefresh, onRefresh]);

  // Memoized processed data for better performance
  const processedData = useMemo(() => {
    if (!data?.timeSeries) return [];

    return data.timeSeries.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
      fullDate: item.date,
    }));
  }, [data?.timeSeries]);

  // Calculate growth indicators (for future use)
  useMemo(() => {
    if (!processedData.length) return {};

    const latest = processedData[processedData.length - 1];
    const previous = processedData[processedData.length - 2];

    if (!previous || !latest) return {};

    return {
      users: ((latest.users - previous.users) / previous.users) * 100,
      pets: ((latest.pets - previous.pets) / previous.pets) * 100,
      matches: ((latest.matches - previous.matches) / previous.matches) * 100,
      messages: ((latest.messages - previous.messages) / previous.messages) * 100,
      revenue: ((latest.revenue - previous.revenue) / previous.revenue) * 100,
    };
  }, [processedData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const MetricCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color = 'primary',
    formatValue = formatNumber,
    subtitle,
  }: {
    title: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
    icon: React.ComponentType<any>;
    color?: keyof typeof COLORS;
    formatValue?: (value: number) => string;
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      role="region"
      aria-label={`${title} metric card`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
            {subtitle ? <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p> : null}
          </div>
        </div>
        {trend ? getTrendIcon(trend) : null}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatValue(value)}</p>
        {change !== undefined && (
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ChartContainer = ({
    children,
    title,
    subtitle,
    className = '',
  }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label={`${title} chart`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle ? <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p> : null}
      </div>
      <div className="h-80">{children}</div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      role="main"
      aria-label="Analytics dashboard"
    >
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '7d' || v === '30d' || v === '90d' || v === '1y') setSelectedPeriod(v);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label="Select time period"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-gray-500" />
            <select
              value={viewMode}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'overview' || v === 'detailed' || v === 'comparison') setViewMode(v);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              aria-label="Select view mode"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setShowFilters(!showFilters); }}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label="Toggle filters"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Refresh data"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => onExport?.('csv')}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Export data"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters ? <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            role="region"
            aria-label="Filters panel"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metric Focus
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'users' || v === 'pets' || v === 'matches' || v === 'messages' || v === 'revenue') setSelectedMetric(v);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="users">Users</option>
                  <option value="pets">Pets</option>
                  <option value="matches">Matches</option>
                  <option value="messages">Messages</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'line' || v === 'area' || v === 'bar' || v === 'composed') setChartType(v);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => { setAutoRefresh(e.target.checked); }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Auto-refresh
                  </span>
                </label>
              </div>
            </div>
          </motion.div> : null}
      </AnimatePresence>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data.users.total}
          change={data.users.growth}
          trend={data.users.trend}
          icon={UsersIcon}
          color="primary"
        />
        <MetricCard
          title="Active Pets"
          value={data.pets.total}
          change={data.pets.growth}
          trend={data.pets.trend}
          icon={HeartIcon}
          color="success"
        />
        <MetricCard
          title="Total Matches"
          value={data.matches.total}
          change={data.matches.growth}
          trend={data.matches.trend}
          icon={HeartIcon}
          color="warning"
        />
        <MetricCard
          title="Messages Sent"
          value={data.messages.total}
          change={data.messages.growth}
          trend={data.messages.trend}
          icon={ChatBubbleLeftRightIcon}
          color="info"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Daily Active Users"
          value={data.engagement.dailyActiveUsers}
          icon={UsersIcon}
          color="primary"
          subtitle="Last 24 hours"
        />
        <MetricCard
          title="Avg Session Duration"
          value={data.engagement.averageSessionDuration}
          icon={ClockIcon}
          color="secondary"
          formatValue={(val) => `${Math.round(val)}m`}
          subtitle="Minutes per session"
        />
        <MetricCard
          title="Retention Rate"
          value={data.engagement.retentionRate}
          icon={ArrowTrendingUpIcon}
          color="success"
          formatValue={(val) => `${val.toFixed(1)}%`}
          subtitle="User retention"
        />
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={data.revenue.totalRevenue}
          icon={ChartBarIcon}
          color="success"
          formatValue={formatCurrency}
        />
        <MetricCard
          title="Monthly Recurring"
          value={data.revenue.monthlyRecurringRevenue}
          icon={ArrowTrendingUpIcon}
          color="primary"
          formatValue={formatCurrency}
        />
        <MetricCard
          title="ARPU"
          value={data.revenue.averageRevenuePerUser}
          icon={UsersIcon}
          color="info"
          formatValue={formatCurrency}
          subtitle="Average revenue per user"
        />
        <MetricCard
          title="Conversion Rate"
          value={data.revenue.conversionRate}
          icon={ArrowTrendingUpIcon}
          color="warning"
          formatValue={(val) => `${val.toFixed(1)}%`}
        />
      </div>

      {/* Main Time Series Chart */}
      <ChartContainer
        title="Platform Growth Trends"
        subtitle={`${selectedMetric} over the last ${selectedPeriod}`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {chartType === 'line' ? (
            <LineChart data={processedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), selectedMetric]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={processedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), selectedMetric]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
                strokeWidth={3}
              />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={processedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), selectedMetric]}
              />
              <Legend />
              <Bar
                dataKey={selectedMetric}
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <ComposedChart data={processedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), selectedMetric]}
              />
              <Legend />
              <Bar
                dataKey={selectedMetric}
                fill={COLORS.primary}
                opacity={0.7}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <ChartContainer
          title="Geographic Distribution"
          subtitle="Users by country"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data.geographicData}
              layout="horizontal"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                type="number"
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis
                dataKey="country"
                type="category"
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), 'Users']}
              />
              <Bar
                dataKey="users"
                fill={COLORS.success}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Device Statistics */}
        <ChartContainer
          title="Device Distribution"
          subtitle="Platform usage by device"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data.deviceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ device, percentage }) => `${device} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.deviceStats.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | string) => [formatNumber(Number(value)), 'Users']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Security Metrics */}
      <ChartContainer
        title="Security Overview"
        subtitle="Platform security and threat monitoring"
        className="border-l-4 border-l-red-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {data.securityMetrics.totalAlerts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.securityMetrics.criticalAlerts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.securityMetrics.resolvedAlerts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {data.securityMetrics.averageResponseTime}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <RadarChart
              data={[
                {
                  subject: 'Authentication',
                  A: 85,
                  B: 90,
                  fullMark: 100,
                },
                {
                  subject: 'Authorization',
                  A: 92,
                  B: 88,
                  fullMark: 100,
                },
                {
                  subject: 'Data Protection',
                  A: 78,
                  B: 95,
                  fullMark: 100,
                },
                {
                  subject: 'Network Security',
                  A: 88,
                  B: 82,
                  fullMark: 100,
                },
                {
                  subject: 'Monitoring',
                  A: 95,
                  B: 90,
                  fullMark: 100,
                },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
              />
              <Radar
                name="Current"
                dataKey="A"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
              <Radar
                name="Target"
                dataKey="B"
                stroke={COLORS.secondary}
                fill={COLORS.secondary}
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Top Performers */}
      <ChartContainer
        title="Top Performers"
        subtitle="Highest performing users and pets"
      >
        <div className="space-y-4">
          {data.topPerformers.slice(0, 5).map((performer, index) => (
            <motion.div
              key={performer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{performer.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {performer.type} • {performer.metric}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {performer.score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
            </motion.div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
