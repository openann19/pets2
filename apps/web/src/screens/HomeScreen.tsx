/**
 * HomeScreen - WEB VERSION
 * Main home screen matching mobile HomeScreen exactly
 */

'use client';

import React, { useMemo } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import { useTranslation } from 'react-i18next';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/layout/AdvancedHeader';
import { useTheme } from '@/theme';
import {
  QuickActionsSection,
  RecentActivityFeed,
  PremiumSection,
} from '@/components/home';
import { useHomeScreen } from '@/hooks/screens/useHomeScreen';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation('common');

  const {
    stats,
    recentActivity,
    refreshing,
    isLoading,
    error,
    onRefresh,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleCommunityPress,
    handlePremiumPress,
    handleMyPetsPress,
    handleCreatePetPress,
    handleSettingsPress,
  } = useHomeScreen();

  // Prepare quick actions data
  const quickActions = useMemo(
    () => [
      {
        id: 'swipe',
        icon: 'heart',
        label: t('home.swipe_action') || 'Swipe',
        color: 'primary' as const,
        glowColor: 'primary' as const,
        gradient: 'primary' as const,
        onPress: handleSwipePress,
        badge: stats.matches,
        delay: 0,
      },
      {
        id: 'matches',
        icon: 'chatbubbles',
        label: t('home.matches_action') || 'Matches',
        color: 'success' as const,
        glowColor: 'success' as const,
        gradient: 'primary' as const,
        onPress: handleMatchesPress,
        badge: stats.messages,
        delay: 100,
      },
      {
        id: 'my-pets',
        icon: 'person',
        label: t('home.my_pets_action') || 'My Pets',
        color: 'secondary' as const,
        glowColor: 'secondary' as const,
        gradient: 'secondary' as const,
        onPress: handleMyPetsPress,
        badge: stats.pets,
        delay: 200,
      },
      {
        id: 'create-pet',
        icon: 'add',
        label: t('home.create_pet_action') || 'Add Pet',
        color: 'warning' as const,
        glowColor: 'warning' as const,
        gradient: 'secondary' as const,
        onPress: handleCreatePetPress,
        delay: 300,
      },
      {
        id: 'community',
        icon: 'people',
        label: t('home.community_action') || 'Community',
        color: 'primary' as const,
        glowColor: 'primary' as const,
        gradient: 'premium' as const,
        onPress: handleCommunityPress,
        delay: 400,
      },
      {
        id: 'settings',
        icon: 'settings',
        label: t('home.settings_action') || 'Settings',
        color: 'secondary' as const,
        glowColor: 'secondary' as const,
        gradient: 'secondary' as const,
        onPress: handleSettingsPress,
        delay: 500,
      },
    ],
    [
      stats,
      handleSwipePress,
      handleMatchesPress,
      handleMyPetsPress,
      handleCreatePetPress,
      handleCommunityPress,
      handleSettingsPress,
      t,
    ]
  );

  // Loading state
  if (isLoading && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'PawfectMatch',
              subtitle: `Welcome back, ${user?.firstName ?? 'Pet Lover'}!`,
              showBackButton: false,
            })}
          />
        }
      >
        <div style={{ padding: theme.spacing.lg }}>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} padding="lg" radius="md" shadow="elevation1" tone="surface">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ScreenShell>
    );
  }

  // Error state
  if (error && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'PawfectMatch',
              subtitle: `Welcome back, ${user?.firstName ?? 'Pet Lover'}!`,
              showBackButton: false,
            })}
          />
        }
      >
        <div style={{ padding: theme.spacing.lg }}>
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              <h3
                className="font-semibold mb-2"
                style={{
                  fontSize: theme.typography.h2.size,
                  color: theme.colors.onSurface,
                }}
              >
                {t('home.error.title') || 'Unable to load home data'}
              </h3>
              <p
                className="mb-4"
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                }}
              >
                {error.message || t('home.error.message') || 'Please check your connection and try again'}
              </p>
              <Button
                title={t('home.error.retry') || 'Retry'}
                variant="primary"
                onPress={onRefresh}
              />
            </div>
          </Card>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: 'PawfectMatch',
            ...(user?.firstName && { subtitle: `Welcome back, ${user.firstName}!` }),
            showBackButton: false,
          })}
        />
      }
    >
      <div className="pb-20">
        {/* Quick Actions */}
        <QuickActionsSection actions={quickActions} />

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <RecentActivityFeed activities={recentActivity} />
        )}

        {/* Premium Section */}
        <PremiumSection onUpgradePress={handlePremiumPress} />

        {/* Stats Summary Card */}
        <div style={{ padding: theme.spacing.lg, paddingTop: 0 }}>
          <Card padding="lg" radius="md" shadow="elevation1" tone="surface">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: theme.colors.primary }}
                >
                  {stats.matches}
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.onMuted }}
                >
                  Matches
                </p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: theme.colors.primary }}
                >
                  {stats.messages}
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.onMuted }}
                >
                  Messages
                </p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: theme.colors.primary }}
                >
                  {stats.pets}
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.onMuted }}
                >
                  Pets
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ScreenShell>
  );
}
