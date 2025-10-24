/**
 * 📊 PHASE 3: Analytics Dashboard Page
 * Premium analytics and insights for users
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useUserAnalytics, useMatchAnalytics, usePremiumTier } from '../../../src/hooks/premium-hooks';
import { useAuthStore } from '../../../src/lib/auth-store';
import PremiumCard from '../../../src/components/UI/PremiumCard';
import PremiumButton from '../../../src/components/UI/PremiumButton';
import LoadingSpinner from '../../../src/components/UI/LoadingSpinner';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  const { analytics, isLoading } = useUserAnalytics(user?.id || '', period);
  const { matchAnalytics } = useMatchAnalytics(user?.id || '');
  const { hasFeature } = usePremiumTier(user?.id || '');

  const hasAnalyticsAccess = hasFeature('analytics');

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <ChartBarIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Feature
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Analytics is available for Premium Plus and higher tiers
          </p>
          <PremiumButton size="lg">
            Upgrade to Premium Plus
          </PremiumButton>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" variant="gradient" />
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    profileViews: 0,
    swipesReceived: 0,
    matchesCreated: 0,
    messagesExchanged: 0,
    videoCalls: 0,
    successRate: 0,
  };

  const trends = analytics?.trends || {
    viewsChange: 0,
    matchesChange: 0,
    engagementChange: 0,
  };

  const insights = analytics?.insights || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your performance and get insights
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Views */}
          <MetricCard
            title="Profile Views"
            value={metrics.profileViews}
            change={trends.viewsChange}
            icon={ChartBarIcon}
            color="from-blue-500 to-cyan-500"
          />

          {/* Matches */}
          <MetricCard
            title="New Matches"
            value={metrics.matchesCreated}
            change={trends.matchesChange}
            icon={HeartIcon}
            color="from-pink-500 to-rose-500"
          />

          {/* Messages */}
          <MetricCard
            title="Messages"
            value={metrics.messagesExchanged}
            change={trends.engagementChange}
            icon={ChatBubbleLeftIcon}
            color="from-purple-500 to-indigo-500"
          />

          {/* Video Calls */}
          <MetricCard
            title="Video Calls"
            value={metrics.videoCalls}
            change={0}
            icon={VideoCameraIcon}
            color="from-orange-500 to-red-500"
          />

          {/* Success Rate */}
          <MetricCard
            title="Success Rate"
            value={`${metrics.successRate}%`}
            change={0}
            icon={ArrowTrendingUpIcon}
            color="from-green-500 to-emerald-500"
          />

          {/* Swipes Received */}
          <MetricCard
            title="Swipes Received"
            value={metrics.swipesReceived}
            change={0}
            icon={CalendarIcon}
            color="from-yellow-500 to-amber-500"
          />
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Insights & Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Match Analytics */}
        {matchAnalytics && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Match Performance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {matchAnalytics.totalMatches}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Successful Meetups</p>
                <p className="text-3xl font-bold text-green-600">
                  {matchAnalytics.successfulMeetups}
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-600">
                  {matchAnalytics.averageResponseTime}h
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component with Premium styling
function MetricCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: number | string;
  change: number;
  icon: any;
  color: string;
}) {
  const isPositive = change >= 0;
  
  return (
    <PremiumCard hover glow variant="gradient">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== 0 && (
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </PremiumCard>
  );
}

// Insight Card Component with Premium styling
function InsightCard({ insight }: { insight: any }) {
  const colors: Record<string, string> = {
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-blue-500 to-cyan-500',
    tip: 'from-purple-500 to-pink-500',
  };

  return (
    <PremiumCard hover variant="gradient">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors[insight.type]}`}>
          <LightBulbIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {insight.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {insight.description}
          </p>
          {insight.actionable && (
            <PremiumButton variant="ghost" size="sm">
              {insight.action} →
            </PremiumButton>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
