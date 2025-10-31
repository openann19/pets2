/**
 * Dashboard/HomeScreen - Web Version
 * Identical to mobile HomeScreen structure
 */

'use client';

import React, { useRef } from 'react';
import { useAuthStore } from '@/src/lib/auth-store';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { EmptyStates } from '@/src/components/common/EmptyStates';
import { useHomeScreen } from '@/src/hooks/screens/useHomeScreen';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useErrorHandling } from '@/src/hooks/useErrorHandling';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  SparklesIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      refetch();
    },
  });

  // Error handling with retry
  const {
    error: errorHandlingError,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false,
    logError: true,
  });

  const {
    stats,
    recentActivity,
    refreshing,
    isLoading,
    error,
    onRefresh,
    refetch,
    handleProfilePress,
    handleSettingsPress,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleCommunityPress,
    handlePremiumPress,
  } = useHomeScreen();

  // Loading state
  if (isLoading && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PawfectMatch
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName ?? 'Pet Lover'}!
              </p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </ScreenShell>
    );
  }

  // Offline state
  if (isOffline && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PawfectMatch
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName ?? 'Pet Lover'}!
              </p>
            </div>
          </div>
        }
      >
        <EmptyStates.Offline
          title={t('home.offline.title') || "You're offline"}
          message={t('home.offline.message') || 'Connect to the internet to see your home feed'}
        />
      </ScreenShell>
    );
  }

  // Error state
  if ((error || errorHandlingError) && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ScreenShell
        header={
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PawfectMatch
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName ?? 'Pet Lover'}!
              </p>
            </div>
          </div>
        }
      >
        <EmptyStates.Error
          title={t('home.error.title') || 'Unable to load home data'}
          message={errorHandlingError?.userMessage || error?.message || t('home.error.message') || 'Please check your connection and try again'}
          actionLabel={t('home.error.retry') || 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      </ScreenShell>
    );
  }

  // Prepare quick actions data - pet-first with enhanced actions
  const quickActions = React.useMemo(
    () => [
      {
        id: 'pawfiles',
        icon: UserGroupIcon,
        label: 'Pawfiles',
        color: 'primary' as const,
        onPress: () => router.push('/pawfiles'),
        description: 'Manage your pets',
      },
      {
        id: 'swipe',
        icon: HeartIcon,
        label: t('home.swipe_action') || 'Swipe',
        color: 'primary' as const,
        onPress: handleSwipePress,
      },
      {
        id: 'matches',
        icon: UsersIcon,
        label: t('home.matches_action') || 'Matches',
        color: 'success' as const,
        onPress: handleMatchesPress,
        badge: stats.matches > 0 ? stats.matches : undefined,
      },
      {
        id: 'find-playmates',
        icon: HeartIcon,
        label: 'Find Playmates',
        color: 'success' as const,
        onPress: () => router.push('/matches'),
        description: 'Discover playdate partners',
      },
      {
        id: 'map',
        icon: MapPinIcon,
        label: 'Pet-Friendly Map',
        color: 'warning' as const,
        onPress: () => router.push('/map'),
        description: 'Explore venues',
      },
      {
        id: 'messages',
        icon: ChatBubbleLeftRightIcon,
        label: t('home.messages_action') || 'Messages',
        color: 'success' as const,
        onPress: handleMessagesPress,
        badge: stats.messages > 0 ? stats.messages : undefined,
      },
      {
        id: 'safety',
        icon: ShieldCheckIcon,
        label: 'Safety Center',
        color: 'warning' as const,
        onPress: () => router.push('/safety'),
        description: 'Community safety',
      },
      {
        id: 'premium',
        icon: StarIcon,
        label: t('home.premium_action') || 'Premium',
        color: 'warning' as const,
        onPress: handlePremiumPress,
      },
    ],
    [
      t,
      handleSwipePress,
      handleMatchesPress,
      handleMessagesPress,
      handleProfilePress,
      handleCommunityPress,
      handlePremiumPress,
      stats.matches,
      stats.messages,
    ],
  );

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  PawfectMatch
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.firstName ?? 'Pet Lover'}!
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleProfilePress}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSettingsPress}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Settings"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div
        ref={scrollRef}
        className="overflow-y-auto h-full"
        onScroll={() => {
          // Handle scroll if needed
        }}
      >
        {/* Quick Actions Section - matching mobile structure */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('home.quick_actions') || 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.onPress}
                  className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full mb-2 ${
                      action.color === 'primary' ? 'bg-purple-100' :
                      action.color === 'success' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        action.color === 'primary' ? 'text-purple-600' :
                        action.color === 'success' ? 'text-green-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                    {action.badge && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {action.badge}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('home.recent_activity') || 'Recent Activity'}
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('home.no_activity') || 'No recent activity'}
              </div>
            )}
          </div>
        </section>

        {/* Premium Features Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {t('home.premium.title') || 'Unlock Premium Features'}
                </h3>
                <p className="text-white/90">
                  {t('home.premium.description') || 'Get unlimited matches and AI insights'}
                </p>
              </div>
              <button
                onClick={handlePremiumPress}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                {t('home.premium.cta') || 'Upgrade'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </ScreenShell>
  );
}
