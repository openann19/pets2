import { Ionicons, type IconProps } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, type ComponentProps } from "react";
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
import { gdprService } from "../services/gdprService";
import type { RootStackScreenProps } from "../navigation/types";
import {
  ProfileSummarySection,
  NotificationSettingsSection,
  AccountSettingsSection,
  DangerZoneSection
} from './settings';

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
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });

  const [preferences, setPreferences] = useState({
    maxDistance: 50,
    ageRange: { min: 0, max: 30 },
    species: [] as string[],
    intents: [] as string[],
  });

  const [deletionStatus, setDeletionStatus] = useState<{
    isPending: boolean;
    daysRemaining: number | null;
  }>({ isPending: false, daysRemaining: null });

  // Check deletion status on mount
  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        const isPending = await gdprService.isDeletionPending();
        const daysRemaining = await gdprService.getDaysUntilDeletion();
        setDeletionStatus({
          isPending,
          daysRemaining: daysRemaining ?? null,
        });
      } catch (error) {
        logger.error("Failed to check deletion status:", { error });
      }
    };

    void checkDeletionStatus();
  }, []);

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
    switch (id) {
      case "export-data":
        Alert.alert(
          "Export Your Data",
          "This will download a copy of all your data. This may take a few minutes.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Export JSON",
              onPress: async () => {
                try {
                  Alert.alert(
                    "Exporting Data",
                    "Please wait while we prepare your data...",
                  );
                  const result = await gdprService.exportAllUserData("json");
                  Alert.alert("Export Complete", result.message);
                } catch (error) {
                  logger.error("Data export failed:", { error });
                  Alert.alert(
                    "Error",
                    "Failed to export your data. Please try again.",
                  );
                }
              },
            },
            {
              text: "Export CSV",
              onPress: async () => {
                try {
                  Alert.alert(
                    "Exporting Data",
                    "Please wait while we prepare your data...",
                  );
                  const result = await gdprService.exportAllUserData("csv");
                  Alert.alert("Export Complete", result.message);
                } catch (error) {
                  logger.error("Data export failed:", { error });
                  Alert.alert(
                    "Error",
                    "Failed to export your data. Please try again.",
                  );
                }
              },
            },
          ],
        );
        break;
      case "logout":
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              try {
                // Implement logout
                useAuthStore.getState().logout();
                Alert.alert(
                  "Logged Out",
                  "You have been logged out successfully",
                );
                navigation.navigate("Home");
              } catch (error) {
                logger.error("Logout failed:", { error });
                Alert.alert("Error", "Failed to log out. Please try again.");
              }
            },
          },
        ]);
        break;
      case "delete":
        if (deletionStatus.isPending) {
          // Cancel deletion
          Alert.alert(
            "Cancel Account Deletion",
            "Are you sure you want to cancel your account deletion?",
            [
              { text: "Keep Scheduled", style: "cancel" },
              {
                text: "Cancel Deletion",
                onPress: async () => {
                  try {
                    // Get the cancellation token from AsyncStorage
                    const token = await AsyncStorage.getItem('gdpr_deletion_token') || '';
                    if (!token) {
                      Alert.alert("Error", "No deletion token found");
                      return;
                    }
                    const result = await gdprService.cancelDeletion(token);
                    
                    // Clear the token
                    await AsyncStorage.removeItem('gdpr_deletion_token');
                    
                    setDeletionStatus({ isPending: false, daysRemaining: null });
                    Alert.alert(
                      "Deletion Cancelled",
                      result.message || "Your account will NOT be deleted.",
                    );
                  } catch (error) {
                    logger.error("Failed to cancel deletion:", { error });
                    Alert.alert(
                      "Error",
                      "Failed to cancel deletion. Please try again.",
                    );
                  }
                },
              },
            ],
          );
        } else {
          // Request deletion
          Alert.alert(
            "Request Account Deletion",
            "Your account will be scheduled for deletion in 30 days. You can cancel anytime during this period. All your data will be permanently deleted after 30 days.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Request Deletion",
                style: "destructive",
                onPress: async () => {
                  try {
                    // TODO: Show password input modal instead of Alert.prompt
                    Alert.prompt(
                      "Enter Password",
                      "Please enter your password to confirm deletion:",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          onPress: async (password) => {
                            if (!password) {
                              Alert.alert("Error", "Password is required");
                              return;
                            }
                            try {
                              const result = await gdprService.requestAccountDeletion(
                                password,
                                "User requested deletion",
                                "No additional feedback"
                              );
                              
                              // Store cancellation token in AsyncStorage
                              await AsyncStorage.setItem('gdpr_deletion_token', result.deletionId);
                              
                              setDeletionStatus({
                                isPending: true,
                                daysRemaining: Math.ceil(
                                  (new Date(result.gracePeriodEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                ),
                              });
                              
                              Alert.alert(
                                "Deletion Scheduled",
                                `Your account will be deleted on ${new Date(
                                  result.gracePeriodEndsAt,
                                ).toLocaleDateString()}. You have 30 days to cancel.`,
                              );
                            } catch (error) {
                              logger.error("Account deletion failed:", { error });
                              Alert.alert(
                                "Error",
                                "Failed to schedule account deletion. Please try again.",
                              );
                            }
                          },
                        },
                      ],
                      "secure-text"
                    );
                  } catch (error) {
                    logger.error("Account deletion failed:", { error });
                    Alert.alert(
                      "Error",
                      "Failed to schedule account deletion. Please try again.",
                    );
                  }
                },
              },
            ],
          );
        }
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
            name={item.icon as ComponentProps<typeof Ionicons>['name']}
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
        <ProfileSummarySection
          onEditProfile={() => handleNavigation('profile')}
        />

        {/* Settings Sections */}
        <NotificationSettingsSection
          settings={notificationSettings}
          onToggle={(id, value) => handleToggle('notifications', id, value)}
        />
        {renderSection("Preferences", preferenceSettings, "preferences")}
        <AccountSettingsSection
          settings={accountSettings}
          onNavigate={handleNavigation}
        />
        {renderSection("Support", supportSettings)}
        <DangerZoneSection
          settings={dangerSettings}
          onAction={handleAction}
        />

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
