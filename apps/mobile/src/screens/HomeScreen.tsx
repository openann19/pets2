import React, { useRef } from "react";
import { useAuthStore } from "@pawfectmatch/core";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  RefreshControl,
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
import { useTheme } from "@/theme";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
  const theme = useTheme();
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
      paddingBottom: 20,
    },
    quickActions: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    actionCard: {
      width: (screenWidth - 60) / 2,
      marginBottom: 16,
    },
    actionContent: {
      alignItems: "center",
      padding: 16,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    badge: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: theme.colors.danger,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    badgeText: {
      color: theme.colors.bg,
      fontSize: 12,
      fontWeight: "bold",
    },
    recentActivity: {
      padding: 20,
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTime: {
      fontSize: 12,
      color: theme.colors.onMuted,
    },
    premiumSection: {
      padding: 20,
    },
    premiumContent: {
      alignItems: "center",
    },
    premiumHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    premiumActions: {
      marginTop: 16,
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
          <RefreshControl
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
                <EliteCard
                  variant="glass"
                  onPress={handleSwipePress}
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
              </FadeInUp>

              <FadeInUp delay={100}>
                <EliteCard
                  variant="glass"
                  onPress={handleMatchesPress}
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
              </FadeInUp>

              <FadeInUp delay={200}>
                <EliteCard
                  variant="glass"
                  onPress={handleMessagesPress}
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
              </FadeInUp>

              <FadeInUp delay={300}>
                <EliteCard
                  variant="glass"
                  onPress={handleProfilePress}
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
                          { backgroundColor: "#8b5cf6" },
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
              </FadeInUp>

              <FadeInUp delay={400}>
                <EliteCard
                  variant="glass"
                  onPress={handleCommunityPress}
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
                      <Ionicons name="star" size={32} color="#fbbf24" />
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

