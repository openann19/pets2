import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

// Import new architecture components
import {
  EliteButton,
  EliteCard,
  Heading2,
  FadeInUp,
  StaggeredContainer,
  useStaggeredAnimation,
  useEntranceAnimation,
} from '../components';
import { Interactive } from '../components/primitives/Interactive';
import { ElasticRefreshControl } from '../components/micro/ElasticRefreshControl';
import { EmptyStates } from '../components/common';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ListSkeleton } from '../components/skeletons';

// Import premium components
import {
  PremiumBody,
  PremiumHeading,
  HolographicCard,
  GlowContainer,
  ParticleEffect,
} from '../components/PremiumComponents';
import { useHomeScreen } from '../hooks/screens/useHomeScreen';
import { useNotificationPermissionPrompt } from '../hooks/useNotificationPermissionPrompt';
import { NotificationPermissionPrompt } from '../components/NotificationPermissionPrompt';
import { useScrollOffsetTracker, useTabReselectRefresh, useTabStatePreservation } from '../hooks/navigation';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { useHeaderWithCounts } from '../hooks/useHeaderWithCounts';
import { useScrollYForHeader } from '../hooks/useScrollYForHeader';
import Animated from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
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

  const reducedMotion = useReduceMotion();

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

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
    },
    quickActions: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: (screenWidth - theme.spacing.xl * 3) / 2,
      marginBottom: theme.spacing.md,
    },
    actionContent: {
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    badge: {
      position: 'absolute',
      top: -theme.spacing.sm,
      right: -theme.spacing.sm,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.md,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
    recentActivity: {
      padding: theme.spacing.lg,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: theme.spacing.sm,
    },
    activityContent: {
      flex: 1,
    },
    activityTime: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    premiumSection: {
      padding: theme.spacing.lg,
    },
    premiumContent: {
      alignItems: 'center',
    },
    premiumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    premiumActions: {
      marginTop: theme.spacing.lg,
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
        {/* Quick Actions with Premium Effects */}
        <FadeInUp delay={0}>
          <View style={styles.quickActions}>
            <Heading2 style={styles.sectionTitle}>{t('home.quick_actions')}</Heading2>
            <StaggeredContainer delay={100}>
              <FadeInUp delay={0}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handleSwipePress}
                  accessibilityLabel={t('home.swipe_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="primary"
                      intensity="medium"
                      animated={true}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.primary },
                          ])}
                        >
                          <Ionicons
                            name="heart"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="primary"
                        >
                          {t('home.swipe_action')}
                        </PremiumBody>
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>

              <FadeInUp delay={100}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handleMatchesPress}
                  accessibilityLabel={t('home.matches_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="success"
                      intensity="medium"
                      animated={true}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.success },
                          ])}
                        >
                          <Ionicons
                            name="people"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="secondary"
                        >
                          {t('home.matches_action')}
                        </PremiumBody>
                        {stats.matches > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{stats.matches}</Text>
                          </View>
                        )}
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>

              <FadeInUp delay={200}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handleMessagesPress}
                  accessibilityLabel={t('home.messages_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="secondary"
                      intensity="medium"
                      animated={true}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.success },
                          ])}
                        >
                          <Ionicons
                            name="chatbubbles"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="secondary"
                        >
                          {t('home.messages_action')}
                        </PremiumBody>
                        {stats.messages > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{stats.messages}</Text>
                          </View>
                        )}
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>

              <FadeInUp delay={300}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handleProfilePress}
                  accessibilityLabel={t('home.profile_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="purple"
                      intensity="medium"
                      animated={true}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.primary },
                          ])}
                        >
                          <Ionicons
                            name="person"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="premium"
                        >
                          {t('home.profile_action')}
                        </PremiumBody>
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>

              <FadeInUp delay={400}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handleCommunityPress}
                  accessibilityLabel={t('home.community_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="warning"
                      intensity="medium"
                      animated={true}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.warning },
                          ])}
                        >
                          <Ionicons
                            name="people"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="secondary"
                        >
                          {t('home.community_action')}
                        </PremiumBody>
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>

              <FadeInUp delay={500}>
                <Interactive
                  variant="lift"
                  haptic="light"
                  onPress={handlePremiumPress}
                  accessibilityLabel={t('home.premium_action')}
                  accessibilityRole="button"
                  accessible={true}
                >
                  <EliteCard
                    variant="glass"
                    style={styles.actionCard}
                  >
                    <GlowContainer
                      color="neon"
                      intensity="heavy"
                      animated={!reducedMotion}
                    >
                      <View style={styles.actionContent}>
                        <View
                          style={StyleSheet.flatten([
                            styles.actionIcon,
                            { backgroundColor: theme.colors.warning },
                          ])}
                        >
                          <Ionicons
                            name="star"
                            size={24}
                            color={theme.colors.bg}
                          />
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="semibold"
                          gradient="holographic"
                        >
                          {t('home.premium_action')}
                        </PremiumBody>
                      </View>
                    </GlowContainer>
                  </EliteCard>
                </Interactive>
              </FadeInUp>
            </StaggeredContainer>
          </View>
        </FadeInUp>

        {/* Recent Activity with Holographic Effects */}
        <FadeInUp delay={400}>
          <View style={styles.recentActivity}>
            <PremiumHeading
              level={2}
              gradient="secondary"
              animated={!reducedMotion}
            >
              {t('home.recent_activity')}
            </PremiumHeading>
            <HolographicCard
              variant="cyber"
              size="md"
              animated={!reducedMotion}
              shimmer={!reducedMotion}
              glow={!reducedMotion}
            >
              <StaggeredContainer delay={50}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <FadeInUp key={activity.id} delay={index * 50}>
                      <View style={styles.activityItem}>
                        <GlowContainer
                          color={activity.type === 'match' ? 'primary' : 'secondary'}
                          intensity="light"
                          animated={!reducedMotion}
                        >
                          <View style={styles.activityIcon}>
                            <Ionicons
                              name={activity.type === 'match' ? 'heart' : 'chatbubble'}
                              size={20}
                              color={theme.colors.primary}
                            />
                          </View>
                        </GlowContainer>
                        <View style={styles.activityContent}>
                          <PremiumBody
                            size="base"
                            weight="semibold"
                            gradient={activity.type === 'match' ? 'primary' : 'secondary'}
                          >
                            {activity.title}
                          </PremiumBody>
                          <PremiumBody
                            size="sm"
                            weight="regular"
                          >
                            {activity.description}
                          </PremiumBody>
                        </View>
                        <PremiumBody
                          size="sm"
                          weight="regular"
                        >
                          {activity.timeAgo}
                        </PremiumBody>
                      </View>
                    </FadeInUp>
                  ))
                ) : (
                  <FadeInUp delay={0}>
                    <View style={styles.activityItem}>
                      <PremiumBody size="sm" weight="regular">
                        {t('home.no_recent_activity')}
                      </PremiumBody>
                    </View>
                  </FadeInUp>
                )}
              </StaggeredContainer>
            </HolographicCard>
          </View>
        </FadeInUp>

        {/* Premium Features with Particle Effects */}
        <FadeInUp delay={600}>
          <View style={styles.premiumSection}>
            <PremiumHeading
              level={2}
              gradient="holographic"
              animated={!reducedMotion}
              glow={!reducedMotion}
            >
              {t('home.premium_features')}
            </PremiumHeading>
            <View style={{ position: 'relative' }}>
              {!reducedMotion && (
                <ParticleEffect
                  count={15}
                  variant="neon"
                  speed="normal"
                />
              )}
              <HolographicCard
                variant="rainbow"
                size="lg"
                animated={!reducedMotion}
                shimmer={!reducedMotion}
                glow={!reducedMotion}
              >
                <View style={styles.premiumContent}>
                  <View style={styles.premiumHeader}>
                    <GlowContainer
                      color="neon"
                      intensity="heavy"
                      animated={!reducedMotion}
                    >
                      <Ionicons
                        name="star"
                        size={32}
                        color={theme.colors.warning}
                        accessibilityLabel={t('home.featured')}
                      />
                    </GlowContainer>
                    <PremiumHeading
                      level={3}
                      gradient="holographic"
                      animated={!reducedMotion}
                      glow={!reducedMotion}
                    >
                      {t('home.premium_title')}
                    </PremiumHeading>
                  </View>
                  <PremiumBody
                    size="base"
                    weight="regular"
                    gradient="primary"
                  >
                    {t('home.premium_description')}
                  </PremiumBody>
                  <View style={styles.premiumActions}>
                    <EliteButton
                      title={t('home.upgrade_now')}
                      variant="primary"
                      size="lg"
                      onPress={handlePremiumPress}
                      accessibilityLabel={t('home.upgrade_now')}
                      accessibilityRole="button"
                    />
                  </View>
                </View>
              </HolographicCard>
            </View>
          </View>
        </FadeInUp>
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
