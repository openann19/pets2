import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AdvancedCard, CardConfigs } from "../components/Advanced/AdvancedCard";
import {
  AdvancedHeader,
  HeaderConfigs,
} from "../components/Advanced/AdvancedHeader";
import { AdvancedButton } from "../components/Advanced/AdvancedInteractionSystem";
import { matchesAPI } from "../services/api";
import { useAuthStore } from "@pawfectmatch/core";

type RootStackParamList = {
  Settings: undefined;
  Home: undefined;
  Profile: undefined;
};

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

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
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    likes: false,
    reminders: true,
  });

  const [preferences, setPreferences] = useState({
    locationServices: true,
    analytics: false,
    darkMode: false,
  });

  const notificationSettings: SettingItem[] = [
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
    {
      id: "likes",
      title: "Likes & Super Likes",
      subtitle: "Notifications for likes and super likes",
      icon: "thumbs-up",
      type: "toggle",
      value: notifications.likes,
    },
    {
      id: "reminders",
      title: "Reminders",
      subtitle: "Daily reminders to check your matches",
      icon: "notifications",
      type: "toggle",
      value: notifications.reminders,
    },
  ];

  const preferenceSettings: SettingItem[] = [
    {
      id: "locationServices",
      title: "Location Services",
      subtitle: "Allow access to location for better matches",
      icon: "location",
      type: "toggle",
      value: preferences.locationServices,
    },
    {
      id: "analytics",
      title: "Analytics",
      subtitle: "Help improve the app with usage data",
      icon: "analytics",
      type: "toggle",
      value: preferences.analytics,
    },
    {
      id: "darkMode",
      title: "Dark Mode",
      subtitle: "Switch to dark theme",
      icon: "moon",
      type: "toggle",
      value: preferences.darkMode,
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
      id: "logout",
      title: "Log Out",
      subtitle: "Sign out of your account",
      icon: "log-out",
      type: "action",
    },
    {
      id: "delete",
      title: "Delete Account",
      subtitle: "Permanently delete your account",
      icon: "trash",
      type: "action",
      destructive: true,
    },
  ];

  const handleToggle = async (
    category: "notifications" | "preferences",
    id: string,
    value: boolean,
  ) => {
    try {
      if (category === "notifications") {
        setNotifications((prev) => ({ ...prev, [id]: value }));
        // Update API
        await matchesAPI.updateUserSettings({
          notifications: { ...notifications, [id]: value },
        } as any);
      } else {
        setPreferences((prev) => ({ ...prev, [id]: value }));
        // Update API
        await matchesAPI.updateUserSettings({
          preferences: { ...preferences, [id]: value },
        } as any);
      }
    } catch (error) {
      logger.error("Failed to update settings:", { error });
      Alert.alert("Error", "Failed to update settings. Please try again.");
    }
  };

  const handleNavigation = (id: string) => {
    switch (id) {
      case "profile":
        navigation.navigate("Profile" as any);
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

  const handleAction = (id: string) => {
    switch (id) {
      case "logout":
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              try {
                // Implement logout
                await matchesAPI.auth.logout();
                useAuthStore.getState().logout();
                Alert.alert(
                  "Logged Out",
                  "You have been logged out successfully",
                );
                navigation.navigate("Home" as any);
              } catch (error) {
                logger.error("Logout failed:", { error });
                Alert.alert("Error", "Failed to log out. Please try again.");
              }
            },
          },
        ]);
        break;
      case "delete":
        Alert.alert(
          "Delete Account",
          "This action cannot be undone. All your data will be permanently deleted.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete Account",
              style: "destructive",
              onPress: async () => {
                try {
                  // Implement account deletion
                  await matchesAPI.user.deleteAccount();
                  useAuthStore.getState().logout();
                  Alert.alert(
                    "Account Deleted",
                    "Your account has been deleted",
                  );
                  navigation.navigate("Home" as any);
                } catch (error) {
                  logger.error("Account deletion failed:", { error });
                  Alert.alert(
                    "Error",
                    "Failed to delete account. Please try again.",
                  );
                }
              },
            },
          ],
        );
        break;
    }
  };

  const renderSettingItem = (
    item: SettingItem,
    category?: "notifications" | "preferences",
  ) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        item.destructive && styles.settingItemDestructive,
      ]}
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
          style={[
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.destructive ? "#EF4444" : "#6B7280"}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              item.destructive && styles.settingTitleDestructive,
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                item.destructive && styles.settingSubtitleDestructive,
              ]}
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
            trackColor={{ false: "#D1D5DB", true: "#8B5CF6" }}
            thumbColor={item.value ? "#FFFFFF" : "#F3F4F6"}
          />
        )}
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    <SafeAreaView style={styles.container}>
      {/* Advanced Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: "Settings",
          rightButtons: [
            {
              type: "search",
              onPress: async () => {
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary */}
        <View style={styles.profileSection}>
          <AdvancedCard
            {...CardConfigs.glass({
              interactions: ["hover", "press", "glow"],
              haptic: "light",
              apiAction: async () => {
                const userProfile = await matchesAPI.getUserProfile();
                logger.info("Loaded user profile:", { userProfile });
              },
              actions: [
                {
                  icon: "pencil",
                  title: "Edit",
                  variant: "minimal",
                  onPress: () => {
                    handleNavigation("profile");
                  },
                },
              ],
            })}
            style={styles.profileCard}
          >
            <View style={styles.profileCardContent}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={32} color="#9CA3AF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>John Doe</Text>
                <Text style={styles.profileEmail}>john@example.com</Text>
                <View style={styles.profileStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Free Plan</Text>
                </View>
              </View>
            </View>
          </AdvancedCard>
        </View>

        {/* Settings Sections */}
        {renderSection("Notifications", notificationSettings, "notifications")}
        {renderSection("Preferences", preferenceSettings, "preferences")}
        {renderSection("Account", accountSettings)}
        {renderSection("Support", supportSettings)}
        {renderSection("Account Actions", dangerSettings)}

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
          <Text style={styles.versionSubtitle}>
            Built with ❤️ for pet lovers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
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
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
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
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
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
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
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
    borderBottomColor: "#F3F4F6",
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
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: "#EF4444",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#6B7280",
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
    color: "#6B7280",
    fontWeight: "500",
  },
  versionSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
