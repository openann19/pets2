import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { matchesAPI } from "../services/api";
import { useProfileScreen } from "../hooks/screens/useProfileScreen";
import { useScrollOffsetTracker, useTabReselectRefresh } from "../hooks/navigation";

import type { RootStackScreenProps } from "../navigation/types";
import { Theme } from '../theme/unified-theme';
import MicroPressable from "../components/micro/MicroPressable";

// Import decomposed components
import {
  ProfileHeaderSection,
  ProfileStatsSection,
  ProfileMenuSection,
  ProfileSettingsSection,
} from "./profile/components";

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

  const handleNotificationToggle = useCallback((key: string) => () => {
    handleSettingToggle(key);
  }, [handleSettingToggle]);

  const handlePrivacySettingToggle = useCallback((key: string) => () => {
    handlePrivacyToggle(key);
  }, [handlePrivacyToggle]);

  const onLogout = useCallback(() => {
    haptic.error();
    handleLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }, [handleLogout, navigation]);

  const onNavigateToMyPets = useCallback(() => {
    haptic.tap();
    navigation.navigate("MyPets");
  }, [navigation]);

  const onNavigateToSettings = useCallback(() => {
    haptic.tap();
    navigation.navigate("Settings");
  }, [navigation]);

  const onNavigateToCreatePet = useCallback(() => {
    haptic.confirm();
    navigation.navigate("CreatePet");
  }, [navigation]);

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Profile",
            rightButtons: [
              {
                type: "edit",
                onPress: () => {
                  haptic.tap();
                  logger.info("Edit profile");
                },
                variant: "glass",
                haptic: "light",
              },
              {
                type: "settings",
                onPress: () => {
                  haptic.tap();
                  navigation.navigate("Settings");
                },
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
      }
    >

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Header Section */}
        <Animated.View entering={FadeInDown.duration(220)}>
          <ProfileHeaderSection user={user} />
        </Animated.View>

        {/* Quick Stats Section */}
        <Animated.View entering={FadeInDown.duration(240).delay(50)}>
          <ProfileStatsSection />
        </Animated.View>

        {/* Menu Items Section */}
        <Animated.View entering={FadeInDown.duration(260).delay(100)}>
          <ProfileMenuSection
            onNavigateToMyPets={onNavigateToMyPets}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToCreatePet={onNavigateToCreatePet}
          />
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInDown.duration(280).delay(150)}>
          <ProfileSettingsSection
            notifications={notifications}
            privacy={privacy}
            onNotificationToggle={handleNotificationToggle}
            onPrivacyToggle={handlePrivacySettingToggle}
          />
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <MicroPressable style={styles.logoutButton} onPress={onLogout}>
            <LinearGradient
              colors={[Theme.colors.status.error, "#dc2626"]}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out" size={20} color={Theme.colors.neutral[0]} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </MicroPressable>
        </Animated.View>
      </ScrollView>
    </ScreenShell>
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
});

export default ProfileScreen;
