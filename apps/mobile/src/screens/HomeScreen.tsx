import React, { useRef } from "react";
import { useAuthStore } from "@pawfectmatch/core";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Import new architecture components
import {
  EliteButton,
  EliteCard,
  Heading2,
  FadeInUp,
  StaggeredContainer,
  useStaggeredAnimation,
  useEntranceAnimation,
} from "../components";
import { Interactive } from "../components/primitives/Interactive";
import { ElasticRefreshControl } from "../components/micro/ElasticRefreshControl";

// Import premium components
import {
  PremiumBody,
  PremiumHeading,
  HolographicCard,
  GlowContainer,
  ParticleEffect,
} from "../components/PremiumComponents";
import { useHomeScreen } from "../hooks/screens/useHomeScreen";
import { useScrollOffsetTracker, useTabReselectRefresh } from "../hooks/navigation";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { useTheme } from "@mobile/theme";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
  const { t } = useTranslation('common');

  const {
    stats,
    refreshing,
    onRefresh,
    handleProfilePress,
    handleSettingsPress,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleMyPetsPress,
    handleCreatePetPress,
    handleCommunityPress,
  } = useHomeScreen();

  // Animation hooks
  const { start: startStaggeredAnimation } = useStaggeredAnimation(6, 100);
  const { start: startEntranceAnimation } = useEntranceAnimation("fadeIn", 0);

  useTabReselectRefresh({
    listRef: scrollRef,
    onRefresh,
    getOffset,
    topThreshold: 100,
    cooldownMs: 700,
  });

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
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionCard: {
      width: (screenWidth - theme.spacing.xl * 3) / 2,
      marginBottom: theme.spacing.md,
    },
    actionContent: {
      alignItems: "center",
      padding: theme.spacing.md,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: theme.radii.full,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    badge: {
      position: "absolute",
      top: -theme.spacing.sm,
      right: -theme.spacing.sm,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.md,
      minWidth: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
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
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
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
      alignItems: "center",
    },
    premiumHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    premiumActions: {
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "PawfectMatch",
            subtitle: `Welcome back, ${user?.firstName ?? "Pet Lover"}!`,
            showBackButton: false,
            rightButtons: [
              {
                type: "custom",
                icon: "person-outline",
                onPress: handleProfilePress,
                variant: "glass",
                haptic: "light",
                customComponent: undefined,
              },
              {
                type: "custom",
                icon: "settings-outline",
                onPress: handleSettingsPress,
                variant: "glass",
                haptic: "light",
                customComponent: undefined,
              },
            ],
          })}
        />
      }
    >
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
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
                        <Ionicons name="heart" size={24} color={theme.colors.bg} />
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
                        <Ionicons name="people" size={24} color={theme.colors.bg} />
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
                        <Ionicons name="chatbubbles" size={24} color={theme.colors.bg} />
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
                        <Ionicons name="person" size={24} color={theme.colors.bg} />
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
                        <Ionicons name="people" size={24} color={theme.colors.bg} />
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
            </StaggeredContainer>
          </View>
        </FadeInUp>

        {/* Recent Activity with Holographic Effects */}
        <FadeInUp delay={400}>
          <View style={styles.recentActivity}>
            <PremiumHeading level={2} gradient="secondary" animated={true}>
              {t('home.recent_activity')}
            </PremiumHeading>
            <HolographicCard
              variant="cyber"
              size="md"
              animated={true}
              shimmer={true}
              glow={true}
            >
              <StaggeredContainer delay={50}>
                <FadeInUp delay={0}>
                  <View style={styles.activityItem}>
                    <GlowContainer
                      color="primary"
                      intensity="light"
                      animated={true}
                    >
                      <View style={styles.activityIcon}>
                        <Ionicons name="heart" size={20} color={theme.colors.primary} />
                      </View>
                    </GlowContainer>
                    <View style={styles.activityContent}>
                      <PremiumBody
                        size="base"
                        weight="semibold"
                        gradient="primary"
                      >
                        {t('home.new_match')}
                      </PremiumBody>
                      <PremiumBody size="sm" weight="regular">
                        {t('home.match_description')}
                      </PremiumBody>
                    </View>
                    <PremiumBody size="sm" weight="regular">
                      2m ago
                    </PremiumBody>
                  </View>
                </FadeInUp>

                <FadeInUp delay={50}>
                  <View style={styles.activityItem}>
                    <GlowContainer
                      color="secondary"
                      intensity="light"
                      animated={true}
                    >
                      <View style={styles.activityIcon}>
                        <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
                      </View>
                    </GlowContainer>
                    <View style={styles.activityContent}>
                      <PremiumBody
                        size="base"
                        weight="semibold"
                        gradient="secondary"
                      >
                        {t('home.new_message')}
                      </PremiumBody>
                      <PremiumBody size="sm" weight="regular">
                        {t('home.message_description')}
                      </PremiumBody>
                    </View>
                    <PremiumBody size="sm" weight="regular">
                      5m ago
                    </PremiumBody>
                  </View>
                </FadeInUp>
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
              animated={true}
              glow={true}
            >
              {t('home.premium_features')}
            </PremiumHeading>
            <View style={{ position: "relative" }}>
              <ParticleEffect count={15} variant="neon" speed="normal" />
              <HolographicCard
                variant="rainbow"
                size="lg"
                animated={true}
                shimmer={true}
                glow={true}
              >
                <View style={styles.premiumContent}>
                  <View style={styles.premiumHeader}>
                    <GlowContainer
                      color="neon"
                      intensity="heavy"
                      animated={true}
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
                      animated={true}
                      glow={true}
                    >
                      {t('home.premium_title')}
                    </PremiumHeading>
                  </View>
                  <PremiumBody size="base" weight="regular" gradient="primary">
                    {t('home.premium_description')}
                  </PremiumBody>
                  <View style={styles.premiumActions}>
                    <EliteButton
                      title={t('home.upgrade_now')}
                      variant="primary"
                      size="lg"
                      onPress={handleProfilePress}
                    />
                  </View>
                </View>
              </HolographicCard>
            </View>
          </View>
        </FadeInUp>
      </ScrollView>
    </ScreenShell>
  );
}

