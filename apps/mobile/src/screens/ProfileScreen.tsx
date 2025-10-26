import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { logger } from "@pawfectmatch/core";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmartImage from "../components/common/SmartImage";
import MicroPressable from "../components/micro/MicroPressable";
import HapticSwitch from "../components/micro/HapticSwitch";

import { AdvancedCard, CardConfigs } from "../components/Advanced/AdvancedCard";
import {
  AdvancedHeader,
  HeaderConfigs,
} from "../components/Advanced/AdvancedHeader";
import { DoubleTapLikePlus } from "../components/Gestures/DoubleTapLikePlus";
import { useDoubleTapMetrics } from "../hooks/useInteractionMetrics";
import { matchesAPI } from "../services/api";
import { useProfileScreen } from "../hooks/screens/useProfileScreen";
import { useScrollOffsetTracker, useTabReselectRefresh } from "../hooks/navigation";

import type { RootStackScreenProps } from "../navigation/types";
import { Theme } from '../theme/unified-theme';

type ProfileScreenProps = RootStackScreenProps<"Profile">;

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
  
  const {
    user,
    notifications,
    privacy,
    handleLogout,
    handleSettingToggle,
    handlePrivacyToggle,
  } = useProfileScreen();
  const { startInteraction, endInteraction } = useDoubleTapMetrics();

  useTabReselectRefresh({
    listRef: scrollRef,
    onRefresh: () => {
      // Profile doesn't have a refresh callback, but we can still scroll to top
    },
    getOffset,
    topThreshold: 100,
    cooldownMs: 700,
    nearTopAction: "none", // Just scroll to top, no refresh
  });

  const handleProfileLike = async () => {
    if (!user?._id) return;
    startInteraction('profileLike', { userId: user._id });
    await matchesAPI.likeUser(user._id).catch(() => null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endInteraction('profileLike', true);
  };

  const handleNotificationToggle = (key: string) => () => {
    handleSettingToggle(key);
  };
  const handlePrivacySettingToggle = (key: string) => () => {
    handlePrivacyToggle(key);
  };

  const onLogout = () => {
    handleLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const menuItems: Array<{
    title: string;
    icon: ComponentProps<typeof Ionicons>['name'];
    color: string;
    onPress: () => void;
  }> = [
    {
      title: "My Pets",
      icon: "paw",
      color: Theme.colors.primary[500],
      onPress: () => navigation.navigate("MyPets"),
    },
    {
      title: "Settings",
      icon: "settings",
      color: Theme.colors.status.info,
      onPress: () => navigation.navigate("Settings"),
    },
    {
      title: "Add New Pet",
      icon: "add-circle",
      color: Theme.colors.status.success,
      onPress: () => navigation.navigate("CreatePet"),
    },
    {
      title: "Help & Support",
      icon: "help-circle",
      color: "#8b5cf6",
      onPress: () => {
        Alert.alert("Help", "Help center coming soon!");
      },
    },
    {
      title: "About",
      icon: "information-circle",
      color: Theme.colors.status.warning,
      onPress: () => {
        Alert.alert("About", "PawfectMatch v1.0.0");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Advanced Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: "Profile",
          rightButtons: [
            {
              type: "edit",
              onPress: () => {
                logger.info("Edit profile");
              },
              variant: "glass",
              haptic: "light",
            },
            {
              type: "settings",
              onPress: () => navigation.navigate("Settings"),
              variant: "minimal",
              haptic: "light",
            },
          ],
          apiActions: {
            edit: async () => {
              const userProfile = await matchesAPI.getUserProfile();
              logger.info("Loaded user profile for editing:", { userProfile });
            },
          },
        })}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Header Card */}
        <AdvancedCard
          {...CardConfigs.glass({
            interactions: ["hover", "press", "glow"],
            haptic: "light",
            apiAction: async () => {
              const userProfile = await matchesAPI.getUserProfile();
              logger.info("Loaded user profile:", { userProfile });
            },
          })}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <DoubleTapLikePlus
              onDoubleTap={handleProfileLike}
              heartColor="#ff69b4"
              particles={5}
              haptics={{ enabled: true, style: "light" }}
            >
              <SmartImage
                source={{
                  uri:
                    user?.avatar ??
                    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
                }}
                style={styles.profileImage}
                useShimmer={true}
                rounded={40}
              />
            </DoubleTapLikePlus>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: Theme.colors.neutral[800] }]}>
                {user?.firstName ?? "User"} {user?.lastName ?? ""}
              </Text>
              <Text style={[styles.userEmail, { color: Theme.colors.neutral[500] }]}>
                {user?.email ?? "user@example.com"}
              </Text>
              <Text style={[styles.memberSince, { color: Theme.colors.neutral[400] }]}>
                Member since {new Date().getFullYear()}
              </Text>
            </View>
          </View>
        </AdvancedCard>

        {/* Quick Stats */}
        <AdvancedCard
          {...CardConfigs.glass({
            interactions: ["hover", "press", "glow"],
            haptic: "light",
            apiAction: async () => {
              const [matches] = await Promise.all([
                matchesAPI.getMatches().catch(() => []),
                matchesAPI.getUserProfile().catch(() => null),
              ]);
              logger.info("Loaded stats:", { matches: matches.length });
            },
          })}
          style={styles.statsSection}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pets</Text>
            </View>
          </View>
        </AdvancedCard>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <AdvancedCard
              key={item.title}
              {...CardConfigs.glass({
                interactions: ["hover", "press", "glow", "bounce"],
                haptic: "medium",
                onPress: () => {
                  try {
                    item.onPress();
                  } catch (error) {
                    logger.error("Menu item action failed:", { error });
                  }
                },
                apiAction: async () => {
                  logger.info(`Menu item ${item.title} API action`);
                },
              })}
              style={styles.menuItem}
            >
              <View style={styles.menuItemContent}>
                <LinearGradient
                  colors={[`${item.color}20`, `${item.color}10`]}
                  style={styles.menuIcon}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </LinearGradient>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </AdvancedCard>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <BlurView intensity={20} style={styles.settingsCard}>
            {Object.entries(notifications).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                  </Text>
                  <Text style={styles.settingDescription}>
                    Receive {key} notifications
                  </Text>
                </View>
                <HapticSwitch
                  value={value}
                  onValueChange={handleNotificationToggle(key)}
                />
              </View>
            ))}
          </BlurView>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <BlurView intensity={20} style={styles.settingsCard}>
            {Object.entries(privacy).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Show {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {value ? "Visible to others" : "Hidden from others"}
                  </Text>
                </View>
                <HapticSwitch
                  value={value}
                  onValueChange={handlePrivacySettingToggle(key)}
                />
              </View>
            ))}
          </BlurView>
        </View>

        {/* Logout Button */}
        <MicroPressable style={styles.logoutButton} onPress={onLogout}>
          <LinearGradient
            colors={[Theme.colors.status.error, "#dc2626"]}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out" size={20} color={Theme.colors.neutral[0]} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </MicroPressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.neutral[800],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Theme.colors.neutral[500],
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: Theme.colors.neutral[400],
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.neutral[0],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.neutral[800],
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.neutral[800],
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.neutral[800],
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: Theme.colors.neutral[0],
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ProfileScreen;
