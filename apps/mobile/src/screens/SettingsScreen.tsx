import { Ionicons, type IconProps } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useMemo, type ComponentProps } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  AdvancedHeader,
  HeaderConfigs,
} from "../components/Advanced/AdvancedHeader";
import { matchesAPI } from "../services/api";
import { useAuthStore } from "@pawfectmatch/core";
import gdprService from "../services/gdprService";
import { useSettingsScreen } from "../hooks/screens/useSettingsScreen";
import type { RootStackScreenProps } from "../navigation/types";
import {
  ProfileSummarySection,
  NotificationSettingsSection,
  AccountSettingsSection,
  DangerZoneSection,
} from "./settings";

import { Theme } from '../theme/unified-theme';

type SettingsScreenProps = RootStackScreenProps<"Settings">;

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "toggle" | "navigation" | "action";
  value?: boolean;
  destructive?: boolean;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const {
    notifications,
    preferences,
    deletionStatus,
    setNotifications,
    setPreferences,
    handleLogout,
    handleDeleteAccount,
    handleExportData,
  } = useSettingsScreen();

  const notificationSettings: SettingItem[] = [
    {
      id: "email",
      title: "Email Notifications",
      subtitle: "Receive notifications via email",
      icon: "mail",
      type: "toggle",
      value: notifications.email,
    },
    {
      id: "push",
      title: "Push Notifications",
      subtitle: "Receive push notifications",
      icon: "notifications",
      type: "toggle",
      value: notifications.push,
    },
    {
      id: "matches",
      title: "New Matches",
      subtitle: "Get notified when you have a new match",
      icon: "heart",
      type: "toggle",
      value: notifications.matches,
    },
    {
      id: "messages",
      title: "Messages",
      subtitle: "Receive notifications for new messages",
      icon: "chatbubble",
      type: "toggle",
      value: notifications.messages,
    },
  ];

  // Note: These are examples only - the actual preferences structure is for match filtering
  const preferenceSettings: SettingItem[] = [
    // Add UI preferences here as needed - but won't be in User["preferences"]
    {
      id: "placeholder",
      title: "Preferences",
      subtitle: "Coming soon",
      icon: "settings",
      type: "navigation",
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: "profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "person",
      type: "navigation",
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      subtitle: "Control your privacy and visibility",
      icon: "shield-checkmark",
      type: "navigation",
    },
    {
      id: "subscription",
      title: "Subscription",
      subtitle: "Manage your premium subscription",
      icon: "star",
      type: "navigation",
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle",
      type: "navigation",
    },
    {
      id: "feedback",
      title: "Send Feedback",
      subtitle: "Share your thoughts and suggestions",
      icon: "chatbox-ellipses",
      type: "navigation",
    },
    {
      id: "about",
      title: "About PawfectMatch",
      subtitle: "App version and information",
      icon: "information-circle",
      type: "navigation",
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      id: "export-data",
      title: "Export My Data",
      subtitle: "Download a copy of your data (GDPR)",
      icon: "download",
      type: "action",
    },
    {
      id: "logout",
      title: "Log Out",
      subtitle: "Sign out of your account",
      icon: "log-out",
      type: "action",
    },
    {
      id: "delete",
      title: deletionStatus.isPending
        ? `Cancel Account Deletion (${deletionStatus.daysRemaining} days left)`
        : "Request Account Deletion",
      subtitle: deletionStatus.isPending
        ? "Cancel your pending deletion request"
        : "Permanently delete your account (30-day grace period)",
      icon: deletionStatus.isPending ? "close-circle" : "trash",
      type: "action",
      destructive: !deletionStatus.isPending,
    },
  ];

  const handleToggle = async (
    category: "notifications" | "preferences",
    id: string,
    value: boolean,
  ) => {
    try {
      if (category === "notifications") {
        const updatedNotifications = { ...notifications, [id]: value };
        setNotifications(updatedNotifications);
        // Update API - send full User["preferences"] structure
        await matchesAPI.updateUserSettings({
          maxDistance: preferences.maxDistance,
          ageRange: preferences.ageRange,
          species: preferences.species,
          intents: preferences.intents,
          notifications: updatedNotifications,
        });
      } else {
        // Preferences are already in the right structure
        const updatedPreferences = { ...preferences, [id]: value };
        setPreferences(updatedPreferences);
      }
    } catch (error) {
      logger.error("Failed to update settings:", { error });
      Alert.alert("Error", "Failed to update settings. Please try again.");
    }
  };

  const handleNavigation = (id: string) => {
    haptic.tap();
    switch (id) {
      case "profile":
        navigation.navigate("Profile");
        break;
      case "privacy":
      case "subscription":
      case "help":
      case "feedback":
      case "about":
        Alert.alert(
          "Coming Soon",
          `${id.charAt(0).toUpperCase() + id.slice(1)} feature is coming soon!`,
        );
        break;
      default:
        Alert.alert("Navigation", `Navigate to ${id}`);
    }
  };

  const handleAction = async (id: string) => {
    if (id === "delete") {
      haptic.error();
    } else {
      haptic.confirm();
    }
    
    switch (id) {
      case "export-data":
        await handleExportData();
        break;
      case "logout":
        handleLogout();
        break;
      case "delete":
        handleDeleteAccount();
        break;
      default:
        logger.info(`Unknown action: ${id}`);
    }
  };

  const renderSettingItem = (
    item: SettingItem,
    category?: "notifications" | "preferences",
  ) => (
    <TouchableOpacity
      key={item.id}
      style={StyleSheet.flatten([
        styles.settingItem,
        item.destructive && styles.settingItemDestructive,
      ])}
      onPress={() => {
        if (item.type === "navigation") {
          handleNavigation(item.id);
        } else if (item.type === "action") {
          handleAction(item.id);
        }
      }}
      disabled={item.type === "toggle"}
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon as ComponentProps<typeof Ionicons>["name"]}
            size={20}
            color={item.destructive ? Theme.colors.status.error : Theme.colors.neutral[500]}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={StyleSheet.flatten([
              styles.settingTitle,
              item.destructive && styles.settingTitleDestructive,
            ])}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={StyleSheet.flatten([
                styles.settingSubtitle,
                item.destructive && styles.settingSubtitleDestructive,
              ])}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={(value) =>
              category && handleToggle(category, item.id, value)
            }
            trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.secondary[500] }}
            thumbColor={item.value ? Theme.colors.neutral[0] : Theme.colors.neutral[100]}
          />
        )}
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color={Theme.colors.neutral[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (
    title: string,
    items: SettingItem[],
    category?: "notifications" | "preferences",
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item) => renderSettingItem(item, category))}
      </View>
    </View>
  );

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Settings",
            rightButtons: [
              {
                type: "search",
                onPress: async () => {
                  haptic.tap();
                  logger.info("Search settings");
                },
                variant: "minimal",
                haptic: "light",
              },
            ],
            apiActions: {
              search: async () => {
                logger.info("Search settings API action");
              },
            },
          })}
        />
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary */}
        <Animated.View entering={FadeInDown.duration(220)}>
          <ProfileSummarySection
            onEditProfile={() => handleNavigation("profile")}
          />
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInDown.duration(240).delay(50)}>
          <NotificationSettingsSection
            settings={notificationSettings}
            onToggle={(id, value) => handleToggle("notifications", id, value)}
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.duration(260).delay(100)}>
          {renderSection("Preferences", preferenceSettings, "preferences")}
        </Animated.View>
        
        <Animated.View entering={FadeInDown.duration(280).delay(150)}>
          <AccountSettingsSection
            settings={accountSettings}
            onNavigate={handleNavigation}
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          {renderSection("Support", supportSettings)}
        </Animated.View>
        
        <Animated.View entering={FadeInDown.duration(320).delay(250)}>
          <DangerZoneSection settings={dangerSettings} onAction={handleAction} />
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.duration(340).delay(300)}>
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
            <Text style={styles.versionSubtitle}>
              Built with ❤️ for pet lovers
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.background.secondary",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "Theme.colors.neutral[0]",
    borderBottomWidth: 1,
    borderBottomColor: "Theme.colors.neutral[200]",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[900]",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 0,
  },
  profileCard: {
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "Theme.colors.neutral[100]",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[900]",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    marginBottom: 4,
  },
  profileStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "Theme.colors.status.success",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "Theme.colors.neutral[500]",
    fontWeight: "500",
  },
  editProfileButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "Theme.colors.neutral[500]",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 12,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "Theme.colors.neutral[100]",
  },
  settingItemDestructive: {
    borderBottomColor: "#FEF2F2",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "Theme.colors.neutral[100]",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIconDestructive: {
    backgroundColor: "#FEF2F2",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "Theme.colors.neutral[900]",
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: "Theme.colors.status.error",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "Theme.colors.neutral[500]",
  },
  settingSubtitleDestructive: {
    color: "#FCA5A5",
  },
  settingRight: {
    marginLeft: 12,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    fontWeight: "500",
  },
  versionSubtitle: {
    fontSize: 12,
    color: "Theme.colors.neutral[400]",
    marginTop: 4,
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
