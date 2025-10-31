import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import { ScrollView, StyleSheet } from 'react-native';

// Import new architecture components
import { useStaggeredAnimation, useEntranceAnimation } from '../components';
import { ElasticRefreshControl } from '../components/micro/ElasticRefreshControl';
import { EmptyStates } from '../components/common';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ListSkeleton } from '../components/skeletons';

// Import home components
import {
  QuickActionsSection,
  RecentActivityFeed,
  PremiumSection,
} from '../components/home';
import { useHomeScreen } from '../hooks/screens/useHomeScreen';
import { useNotificationPermissionPrompt } from '../hooks/useNotificationPermissionPrompt';
import { NotificationPermissionPrompt } from '../components/NotificationPermissionPrompt';
import { useScrollOffsetTracker, useTabReselectRefresh, useTabStatePreservation } from '../hooks/navigation';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { usePrefetching } from '../hooks/optimization/usePrefetching';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useHeaderWithCounts } from '../hooks/useHeaderWithCounts';
import { useScrollYForHeader } from '../hooks/useScrollYForHeader';
import Animated from 'react-native-reanimated';


export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
  const { t } = useTranslation('common');

  // Prefetch likely next routes when on Home
  const { prefetchNextRoutes } = usePrefetching({
    wifiOnly: false,
    enableRoutePrefetch: true,
  });

  React.useEffect(() => {
    prefetchNextRoutes('Home');
  }, [prefetchNextRoutes]);

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

  // Tab state preservation
  const { updateScrollOffset, restoreState } = useTabStatePreservation({
    tabName: 'Home',
    scrollRef: scrollRef as any,
    preserveScroll: true,
  });

  // Restore state when screen gains focus
  useEffect(() => {
    restoreState();
  }, [restoreState]);

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

  // Create scrollY SharedValue for header collapse
  const { scrollY, scrollHandler } = useScrollYForHeader();

  // Update SmartHeader with title, badge counts, and scrollY
  useHeaderWithCounts({
    title: 'PawfectMatch',
    ...(user?.firstName && { subtitle: `Welcome back, ${user.firstName}!` }),
    fetchCounts: true,
    scrollY,
  });

  // Notification permission prompt (shows after onboarding)
  const {
    shouldShowPrompt,
    dismissPrompt,
    checkPermissionStatus,
  } = useNotificationPermissionPrompt(true);

  const handlePermissionGranted = async () => {
    await checkPermissionStatus();
  };

  const handlePermissionDenied = async () => {
    await dismissPrompt();
  };

  const handleDismiss = async () => {
    await dismissPrompt();
  };

  // Animation hooks (6 quick actions)
  const { start: startStaggeredAnimation } = useStaggeredAnimation(6, 100);
  const { start: startEntranceAnimation } = useEntranceAnimation('fadeIn', 0);

  useTabReselectRefresh({
    listRef: scrollRef,
    onRefresh: async () => {
      if (isOnline) {
        await onRefresh();
      }
    },
    getOffset,
    topThreshold: 100,
    cooldownMs: 700,
  });

  // Handle scroll to preserve position and header collapse
  const handleScroll = (event: any) => {
    scrollHandler(event); // Header collapse animation
    const offset = event.nativeEvent.contentOffset.y;
    updateScrollOffset(offset);
    onScroll(event);
  };

  // Loading state
  if (isLoading && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ErrorBoundary screenName="HomeScreen">
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
          <ListSkeleton count={5} />
        </ScreenShell>
      </ErrorBoundary>
    );
  }

  // Offline state
  if (isOffline && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ErrorBoundary screenName="HomeScreen">
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
          <EmptyStates.Offline
            title={t('home.offline.title') || "You're offline"}
            message={t('home.offline.message') || 'Connect to the internet to see your home feed'}
          />
        </ScreenShell>
      </ErrorBoundary>
    );
  }

  // Error state
  if ((error || errorHandlingError) && stats.matches === 0 && recentActivity.length === 0) {
    return (
      <ErrorBoundary screenName="HomeScreen">
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
      </ErrorBoundary>
    );
  }

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
    startEntranceAnimation();
  }, [startStaggeredAnimation, startEntranceAnimation]);

  // Prepare quick actions data
  const quickActions = React.useMemo(
    () => [
      {
        id: 'swipe',
        icon: 'heart',
        label: t('home.swipe_action') || 'Swipe',
        color: 'primary' as const,
        glowColor: 'primary' as const,
        gradient: 'primary' as const,
        onPress: handleSwipePress,
        delay: 0,
      },
      {
        id: 'matches',
        icon: 'people',
        label: t('home.matches_action') || 'Matches',
        color: 'success' as const,
        glowColor: 'success' as const,
        gradient: 'secondary' as const,
        onPress: handleMatchesPress,
        ...(stats.matches > 0 && { badge: stats.matches }),
        delay: 100,
      },
      {
        id: 'messages',
        icon: 'chatbubbles',
        label: t('home.messages_action') || 'Messages',
        color: 'success' as const,
        glowColor: 'secondary' as const,
        gradient: 'secondary' as const,
        onPress: handleMessagesPress,
        ...(stats.messages > 0 && { badge: stats.messages }),
        delay: 200,
      },
      {
        id: 'profile',
        icon: 'person',
        label: t('home.profile_action') || 'Profile',
        color: 'primary' as const,
        glowColor: 'secondary' as const,
        gradient: 'premium' as const,
        onPress: handleProfilePress,
        delay: 300,
      },
      {
        id: 'community',
        icon: 'people',
        label: t('home.community_action') || 'Community',
        color: 'warning' as const,
        glowColor: 'warning' as const,
        gradient: 'secondary' as const,
        onPress: handleCommunityPress,
        delay: 400,
      },
      {
        id: 'premium',
        icon: 'star',
        label: t('home.premium_action') || 'Premium',
        color: 'warning' as const,
        glowColor: 'neon' as const,
        gradient: 'holographic' as const,
        onPress: handlePremiumPress,
        delay: 500,
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

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
    },
  });

  return (
    <ErrorBoundary screenName="HomeScreen">
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: 'PawfectMatch',
              subtitle: `Welcome back, ${user?.firstName ?? 'Pet Lover'}!`,
              showBackButton: false,
              rightButtons: [
                {
                  type: 'custom',
                  icon: 'person-outline',
                  onPress: handleProfilePress,
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
                {
                  type: 'custom',
                  icon: 'settings-outline',
                  onPress: handleSettingsPress,
                  variant: 'glass',
                  haptic: 'light',
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
      <Animated.ScrollView
        ref={scrollRef as any}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <ElasticRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions Section */}
        <QuickActionsSection actions={quickActions} />

        {/* Recent Activity Feed */}
        <RecentActivityFeed activities={recentActivity} />

        {/* Premium Features Section */}
        <PremiumSection onUpgradePress={handlePremiumPress} />
      </Animated.ScrollView>

      {/* Notification Permission Prompt - Shows after onboarding */}
      {shouldShowPrompt && (
        <NotificationPermissionPrompt
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
          onDismiss={handleDismiss}
        />
      )}
    </ScreenShell>
    </ErrorBoundary>
  );
}
