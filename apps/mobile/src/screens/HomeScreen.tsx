import React, { useState } from "react";
import { logger } from "@pawfectmatch/core";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@pawfectmatch/core";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Import new architecture components
import {
  Theme,
  EliteButton,
  EliteButtonPresets,
  FXContainer,
  FXContainerPresets,
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodySmall,
  Label,
  useStaggeredAnimation,
  useEntranceAnimation,
} from "../components/NewComponents";

// Import legacy components for backward compatibility
import {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  EliteCard,
  FadeInUp,
  StaggeredContainer,
} from "../components/EliteComponents";

// Import premium components
import {
  PremiumBody,
  PremiumHeading,
  HolographicCard,
  GlowContainer,
  ParticleEffect,
} from "../components/PremiumComponents";
import { matchesAPI } from "../services/api";
import type { RootStackParamList } from "../navigation/types";

const { width: screenWidth } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    matches: 0,
    messages: 0,
    pets: 0,
  });

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(
      6, // Number of sections
      150,
      "gentle",
    );

  const { start: startEntranceAnimation, animatedStyle: entranceStyle } =
    useEntranceAnimation("fadeInUp", 0, "bouncy");

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
    startEntranceAnimation();
  }, [startStaggeredAnimation, startEntranceAnimation]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch real data from API
      const [matches, stats] = await Promise.all([
        matchesAPI.getMatches().catch(() => []),
        matchesAPI
          .getUserStats()
          .catch(() => ({ matches: 0, messages: 0, pets: 0 })),
      ]);

      setStats({
        matches: matches.length,
        messages: stats.messages,
        pets: stats.pets,
      });
    } catch (error) {
      logger.error("Failed to refresh data:", { error });
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    try {
      // ✅ REAL NAVIGATION - Navigate to actual screens
      switch (action) {
        case "swipe":
          navigation.navigate("Swipe");
          break;
        case "matches":
          navigation.navigate("Matches");
          break;
        case "messages":
          // Navigate to Matches screen since Messages is not a separate screen
          navigation.navigate("Matches");
          break;
        case "profile":
          navigation.navigate("Profile");
          break;
        case "settings":
          navigation.navigate("Settings");
          break;
        case "my-pets":
          navigation.navigate("MyPets");
          break;
        case "create-pet":
          navigation.navigate("CreatePet");
          break;
        case "premium":
          // Navigate to Profile screen since Premium is part of profile
          navigation.navigate("Profile");
          break;
        default:
          logger.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      logger.error("Navigation error:", { error });
    }
  };

  const handleProfilePress = () => {
    handleQuickAction("profile");
  };
  const handleSettingsPress = () => {
    handleQuickAction("settings");
  };
  const handleSwipePress = () => {
    handleQuickAction("swipe");
  };
  const handleMatchesPress = () => {
    handleQuickAction("matches");
  };
  const handleMessagesPress = () => {
    handleQuickAction("messages");
  };
  const handleAdoptionPress = () => {
    handleQuickAction("adoption");
  };

  return (
    <EliteContainer gradient="primary">
      {/* Premium Glass Header */}
      <EliteHeader
        title="PawfectMatch"
        subtitle={`Welcome back, ${user?.firstName ?? "Pet Lover"}!`}
        blur={true}
        rightComponent={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <EliteButton
              title=""
              variant="glass"
              size="sm"
              icon="person"
              onPress={handleProfilePress}
            />
            <EliteButton
              title=""
              variant="glass"
              size="sm"
              icon="settings"
              onPress={handleSettingsPress}
            />
          </View>
        }
      />

      <EliteScrollContainer
        gradient="primary"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
          />
        }
      >
        {/* Quick Actions with Premium Effects */}
        <FadeInUp delay={0}>
          <View style={styles.quickActions}>
            <Heading2 style={styles.sectionTitle}>Quick Actions</Heading2>
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
                        style={[
                          styles.actionIcon,
                          { backgroundColor: "#ec4899" },
                        ]}
                      >
                        <Ionicons name="heart" size={24} color="#fff" />
                      </View>
                      <PremiumBody
                        size="sm"
                        weight="semibold"
                        gradient="primary"
                      >
                        Swipe
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
                        style={[
                          styles.actionIcon,
                          { backgroundColor: "#10b981" },
                        ]}
                      >
                        <Ionicons name="people" size={24} color="#fff" />
                      </View>
                      <PremiumBody
                        size="sm"
                        weight="semibold"
                        gradient="secondary"
                      >
                        Matches
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
                        style={[
                          styles.actionIcon,
                          { backgroundColor: "#3b82f6" },
                        ]}
                      >
                        <Ionicons name="chatbubbles" size={24} color="#fff" />
                      </View>
                      <PremiumBody
                        size="sm"
                        weight="semibold"
                        gradient="secondary"
                      >
                        Messages
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
                  tilt={true}
                  magnetic={true}
                  shimmer={true}
                  entrance="scaleIn"
                  onPress={() => {
                    handleQuickAction("profile");
                  }}
                  style={styles.actionCard}
                >
                  <GlowContainer
                    color="purple"
                    intensity="medium"
                    animated={true}
                  >
                    <View style={styles.actionContent}>
                      <View
                        style={[
                          styles.actionIcon,
                          { backgroundColor: "#8b5cf6" },
                        ]}
                      >
                        <Ionicons name="person" size={24} color="#fff" />
                      </View>
                      <PremiumBody
                        size="sm"
                        weight="semibold"
                        gradient="premium"
                      >
                        Profile
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
              Recent Activity
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
                        <Ionicons name="heart" size={20} color="#ec4899" />
                      </View>
                    </GlowContainer>
                    <View style={styles.activityContent}>
                      <PremiumBody
                        size="base"
                        weight="semibold"
                        gradient="primary"
                      >
                        New Match!
                      </PremiumBody>
                      <PremiumBody size="sm" weight="regular">
                        You and Buddy liked each other
                      </PremiumBody>
                    </View>
                    <PremiumBody size="xs" weight="regular">
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
                        <Ionicons name="chatbubble" size={20} color="#3b82f6" />
                      </View>
                    </GlowContainer>
                    <View style={styles.activityContent}>
                      <PremiumBody
                        size="base"
                        weight="semibold"
                        gradient="secondary"
                      >
                        New Message
                      </PremiumBody>
                      <PremiumBody size="sm" weight="regular">
                        From Luna: &quot;Hey there! 🐾&quot;
                      </PremiumBody>
                    </View>
                    <PremiumBody size="xs" weight="regular">
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
              Premium Features
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
                      <Ionicons name="diamond" size={32} color="#fbbf24" />
                    </GlowContainer>
                    <PremiumHeading
                      level={3}
                      gradient="holographic"
                      animated={true}
                      glow={true}
                    >
                      PawfectMatch Premium
                    </PremiumHeading>
                  </View>
                  <PremiumBody size="base" weight="regular" gradient="primary">
                    Unlock unlimited swipes, see who liked you, and get priority
                    in search results.
                  </PremiumBody>
                  <View style={styles.premiumActions}>
                    <EliteButton
                      title="Upgrade Now"
                      variant="holographic"
                      size="lg"
                      icon="diamond"
                      magnetic={true}
                      ripple={true}
                      glow={true}
                      shimmer={true}
                      onPress={() => {
                        handleQuickAction("premium");
                      }}
                    />
                  </View>
                </View>
              </HolographicCard>
            </View>
          </View>
        </FadeInUp>
      </EliteScrollContainer>
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  greeting: {
    fontSize: 16,
    color: "#6c757d",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  recentActivity: {
    padding: 20,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  premiumSection: {
    padding: 20,
  },
  premiumCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumContent: {
    alignItems: "center",
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  premiumActions: {
    marginTop: 16,
  },
  premiumButton: {
    backgroundColor: "#ec4899",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  premiumButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
