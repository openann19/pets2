/**
 * Privacy Settings Screen for Mobile
 * Comprehensive privacy controls and settings
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import type { RootStackParamList } from "../navigation/types";
import { request } from "../services/api";

type PrivacySettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PrivacySettings"
>;

interface PrivacySettings {
  profileVisibility: "public" | "friends" | "nobody";
  showOnlineStatus: boolean;
  showDistance: boolean;
  showLastActive: boolean;
  allowMessages: "everyone" | "matches" | "nobody";
  showReadReceipts: boolean;
  incognitoMode: boolean;
  shareLocation: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

function PrivacySettingsScreen({
  navigation,
}: PrivacySettingsScreenProps): JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "nobody",
    showOnlineStatus: true,
    showDistance: true,
    showLastActive: true,
    allowMessages: "nobody",
    showReadReceipts: true,
    incognitoMode: false,
    shareLocation: true,
    dataSharing: false,
    analyticsTracking: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await request<PrivacySettings>("/api/profile/privacy", {
        method: "GET",
      });

      if (response) {
        setSettings(response);
      }

      logger.info("Privacy settings loaded");
    } catch (error) {
      logger.error("Failed to load privacy settings:", error);
      // Don't show alert on first load - use defaults
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) => {
    try {
      setLoading(true);
      await Haptics.selectionAsync();

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Save to API
      await request("/api/profile/privacy", {
        method: "PUT",
        body: newSettings,
      });

      logger.info("Privacy setting updated", { key, value });
    } catch (error) {
      logger.error("Failed to update privacy setting:", error);
      Alert.alert("Error", "Failed to update setting");
    } finally {
      setLoading(false);
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    control: React.ReactNode,
    danger?: boolean,
  ) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: danger ? colors.error : colors.text },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      {control}
    </View>
  );

  const renderPicker = (
    value: string,
    options: Array<{ label: string; value: string }>,
    onChange: (value: string) => void,
  ) => (
    <View style={styles.pickerContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.pickerOption,
            value === option.value && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => {
            onChange(option.value);
          }}
        >
          <Text
            style={[
              styles.pickerOptionText,
              { color: value === option.value ? "white" : colors.text },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Privacy Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Visibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Profile Visibility
          </Text>
          {renderSettingItem(
            "Who can see my profile",
            "Control who can view your profile and pet information",
            renderPicker(
              settings.profileVisibility,
              [
                { label: "Everyone", value: "public" },
                { label: "Matches Only", value: "friends" },
                { label: "Nobody", value: "nobody" },
              ],
              (value) =>
                updateSetting(
                  "profileVisibility",
                  value as PrivacySettings["profileVisibility"],
                ),
            ),
          )}

          {renderSettingItem(
            "Show online status",
            "Let others know when you are active on the app",
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(value) =>
                updateSetting("showOnlineStatus", value)
              }
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={
                settings.showOnlineStatus ? colors.card : colors.gray500
              }
            />,
          )}

          {renderSettingItem(
            "Show distance",
            "Display how far you are from other users",
            <Switch
              value={settings.showDistance}
              onValueChange={(value) => updateSetting("showDistance", value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={settings.showDistance ? colors.card : colors.gray500}
            />,
          )}

          {renderSettingItem(
            "Show last active time",
            "Show when you were last active on the app",
            <Switch
              value={settings.showLastActive}
              onValueChange={(value) => updateSetting("showLastActive", value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={
                settings.showLastActive ? colors.card : colors.gray500
              }
            />,
          )}
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Communication
          </Text>
          {renderSettingItem(
            "Who can message me",
            "Control who can send you messages",
            renderPicker(
              settings.allowMessages,
              [
                { label: "Everyone", value: "everyone" },
                { label: "Matches Only", value: "matches" },
                { label: "Nobody", value: "nobody" },
              ],
              (value) =>
                updateSetting(
                  "allowMessages",
                  value as PrivacySettings["allowMessages"],
                ),
            ),
          )}

          {renderSettingItem(
            "Show read receipts",
            "Let others know when you have read their messages",
            <Switch
              value={settings.showReadReceipts}
              onValueChange={(value) =>
                updateSetting("showReadReceipts", value)
              }
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={
                settings.showReadReceipts ? colors.card : colors.gray500
              }
            />,
          )}
        </View>

        {/* Privacy Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy Features
          </Text>
          {renderSettingItem(
            "Incognito Mode",
            "Browse profiles without appearing in others' views",
            <Switch
              value={settings.incognitoMode}
              onValueChange={(value) => updateSetting("incognitoMode", value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={settings.incognitoMode ? colors.card : colors.gray500}
            />,
          )}

          {renderSettingItem(
            "Location sharing",
            "Share your location for better matching",
            <Switch
              value={settings.shareLocation}
              onValueChange={(value) => updateSetting("shareLocation", value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={settings.shareLocation ? colors.card : colors.gray500}
            />,
          )}
        </View>

        {/* Data & Analytics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data & Analytics
          </Text>
          {renderSettingItem(
            "Data sharing for improvements",
            "Help us improve the app by sharing anonymized usage data",
            <Switch
              value={settings.dataSharing}
              onValueChange={(value) => updateSetting("dataSharing", value)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={settings.dataSharing ? colors.card : colors.gray500}
            />,
          )}

          {renderSettingItem(
            "Analytics tracking",
            "Allow analytics to help us understand app usage",
            <Switch
              value={settings.analyticsTracking}
              onValueChange={(value) =>
                updateSetting("analyticsTracking", value)
              }
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={
                settings.analyticsTracking ? colors.card : colors.gray500
              }
            />,
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Danger Zone
          </Text>
          {renderSettingItem(
            "Blocked Users",
            "Manage users you have blocked",
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("BlockedUsers")}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>,
            true,
          )}

          {renderSettingItem(
            "Data Download",
            "Download all your personal data (GDPR)",
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                try {
                  setLoading(true);

                  const response = await request<{
                    url: string;
                    estimatedTime: string;
                  }>("/api/profile/export", {
                    method: "GET",
                  });

                  Alert.alert(
                    "Data Export Initiated",
                    `Your data export has been initiated. You will receive an email with your data within ${response.estimatedTime}.`,
                    [{ text: "OK" }],
                  );
                } catch (error) {
                  logger.error("Failed to initiate data export:", error);
                  Alert.alert(
                    "Error",
                    "Failed to initiate data export. Please try again.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>,
            true,
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    padding: 8,
  },
});

export default PrivacySettingsScreen;
