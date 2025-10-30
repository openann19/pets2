import { Ionicons, type IconProps } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useMemo } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { getAccessibilityProps } from '../utils/accessibilityUtils';

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
  LanguageSection,
  AccountSettingsSection,
  DangerZoneSection,
} from "./settings";
import { SettingSection } from "../components/settings/SettingSection";
import { useTheme } from "@mobile/src/theme";
import { useTranslation } from 'react-i18next';

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
  const reducedMotion = useReduceMotion();
  const theme = useTheme();
  const { t } = useTranslation('common');
  
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

  const styles = useMemo(() => StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.onMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 1 },
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
      borderBottomColor: theme.colors.border,
    },
    settingItemDestructive: {
      borderBottomColor: theme.colors.danger + "20",
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
      backgroundColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    settingIconDestructive: {
      backgroundColor: theme.colors.danger + "20",
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.onSurface
      marginBottom: 2,
    },
    settingTitleDestructive: {
      color: theme.colors.danger,
    },
    settingSubtitle: {
      fontSize: 13,
      color: theme.colors.onMuted,
    },
    settingSubtitleDestructive: {
      color: theme.colors.danger,
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
      color: theme.colors.onMuted,
      fontWeight: "500",
    },
    versionSubtitle: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginTop: 4,
    },
  }), [theme]);

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
      id: "ui-demo",
      title: "UI Showcase",
      subtitle: "View all UI components and variants",
      icon: "layers",
      type: "navigation",
    },
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
      Alert.alert(t('settings.error'), t('settings.failed_update'));
    }
  };

  const handleNavigation = (id: string) => {
    haptic.tap();
    switch (id) {
      case "profile":
        navigation.navigate("Profile");
        break;
      case "ui-demo":
        navigation.navigate("UIDemo");
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
      testID={`setting-item-${item.id}`}
      accessibilityLabel={`${item.title}${item.subtitle ? `: ${item.subtitle}` : ''}`}
      accessibilityRole={item.type === "toggle" ? "text" : "button"}
      disabled={item.type === "toggle"}
      onPress={() => {
        if (item.type === "navigation") {
          handleNavigation(item.id);
        } else if (item.type === "action") {
          handleAction(item.id);
        }
      }}
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.destructive ? theme.colors.danger : theme.colors.onMuted}
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
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={item.value ? theme.colors.bg : theme.colors.surface}
          />
        )}
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.onMuted} />
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
            title: t('settings.title'),
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
        {reducedMotion ? (
          <ProfileSummarySection
            onEditProfile={() => { handleNavigation("profile"); }}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(220)}>
            <ProfileSummarySection
              onEditProfile={() => { handleNavigation("profile"); }}
            />
          </Animated.View>
        )}

        {/* Settings Sections */}
        {reducedMotion ? (
          <NotificationSettingsSection
            settings={notificationSettings}
            onToggle={(id, value) => handleToggle("notifications", id, value)}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(240).delay(50)}>
            <NotificationSettingsSection
              settings={notificationSettings}
              onToggle={(id, value) => handleToggle("notifications", id, value)}
            />
          </Animated.View>
        )}
        
        {reducedMotion ? (
          <SettingSection
            title="Preferences"
            items={preferenceSettings}
            category="preferences"
            onToggle={(id, value) => handleToggle("preferences", id, value)}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(260).delay(100)}>
            <SettingSection
              title="Preferences"
              items={preferenceSettings}
              category="preferences"
              onToggle={(id, value) => handleToggle("preferences", id, value)}
            />
          </Animated.View>
        )}
        
        {reducedMotion ? (
          <LanguageSection />
        ) : (
          <Animated.View entering={FadeInDown.duration(280).delay(150)}>
            <LanguageSection />
          </Animated.View>
        )}
        
        {reducedMotion ? (
          <AccountSettingsSection
            settings={accountSettings}
            onNavigate={handleNavigation}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(290).delay(175)}>
            <AccountSettingsSection
              settings={accountSettings}
              onNavigate={handleNavigation}
            />
          </Animated.View>
        )}
        
        {reducedMotion ? (
          <SettingSection
            title="Support"
            items={supportSettings}
            onItemPress={handleNavigation}
          />
        ) : (
          <Animated.View entering={FadeInDown.duration(310).delay(225)}>
            <SettingSection
              title="Support"
              items={supportSettings}
              onItemPress={handleNavigation}
            />
          </Animated.View>
        )}
        
        {reducedMotion ? (
          <DangerZoneSection settings={dangerSettings} onAction={handleAction} />
        ) : (
          <Animated.View entering={FadeInDown.duration(320).delay(250)}>
            <DangerZoneSection settings={dangerSettings} onAction={handleAction} />
          </Animated.View>
        )}

        {/* App Version */}
        {reducedMotion ? (
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
            <Text style={styles.versionSubtitle}>
              Built with ❤️ for pet lovers
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(340).delay(300)}>
            <View style={styles.versionSection}>
              <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
              <Text style={styles.versionSubtitle}>
                Built with ❤️ for pet lovers
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
