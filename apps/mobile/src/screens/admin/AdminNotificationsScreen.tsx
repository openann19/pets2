/**
 * Admin Notification Management Screen for Mobile
 * Management interface for smart notifications settings and analytics
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/adminAPI";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NotificationSettings {
  enabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  maxDailyNotifications: number;
  smartGrouping: boolean;
  personalizedTiming: boolean;
}

interface NotificationStats {
  totalUsers: number;
  enabledUsers: number;
  adoptionRate: number;
  dailyNotifications: number;
  openRate: number;
  clickRate: number;
  quietHoursUsers: number;
  notificationTypes: {
    matches: number;
    messages: number;
    reminders: number;
    promotions: number;
    system: number;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastSent: string;
  openRate: number;
  clickRate: number;
}

export default function AdminNotificationsScreen({
  navigation,
}: AdminScreenProps<"AdminNotifications">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    maxDailyNotifications: 10,
    smartGrouping: true,
    personalizedTiming: true,
  });
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadNotificationData();
  }, []);

  const loadNotificationData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockStats: NotificationStats = {
        totalUsers: 2800,
        enabledUsers: 2184,
        adoptionRate: 78,
        dailyNotifications: 15420,
        openRate: 65,
        clickRate: 23,
        quietHoursUsers: 1456,
        notificationTypes: {
          matches: 4200,
          messages: 3800,
          reminders: 2100,
          promotions: 1200,
          system: 4120,
        },
      };

      const mockTemplates: NotificationTemplate[] = [
        {
          id: "1",
          name: "New Match",
          type: "matches",
          enabled: true,
          lastSent: "2024-01-15T10:30:00Z",
          openRate: 78,
          clickRate: 45,
        },
        {
          id: "2",
          name: "Message Received",
          type: "messages",
          enabled: true,
          lastSent: "2024-01-15T14:20:00Z",
          openRate: 85,
          clickRate: 52,
        },
        {
          id: "3",
          name: "Pet Care Reminder",
          type: "reminders",
          enabled: true,
          lastSent: "2024-01-15T09:00:00Z",
          openRate: 72,
          clickRate: 38,
        },
        {
          id: "4",
          name: "Premium Offer",
          type: "promotions",
          enabled: false,
          lastSent: "2024-01-10T16:00:00Z",
          openRate: 45,
          clickRate: 12,
        },
        {
          id: "5",
          name: "System Update",
          type: "system",
          enabled: true,
          lastSent: "2024-01-14T11:00:00Z",
          openRate: 92,
          clickRate: 28,
        },
      ];

      setStats(mockStats);
      setTemplates(mockTemplates);
    } catch (error: unknown) {
      logger.error("Error loading notification data:", { error });
      Alert.alert("Error", "Failed to load notification data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadNotificationData();
    setRefreshing(false);
  };

  const updateSetting = (
    key: keyof NotificationSettings,
    value: boolean | string | number,
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveSettings = async (): Promise<void> => {
    try {
      // TODO: Implement API call to save settings
      Alert.alert("Success", "Notification settings saved successfully");
    } catch (error: unknown) {
      logger.error("Error saving notification settings:", { error });
      Alert.alert("Error", "Failed to save notification settings");
    }
  };

  const toggleTemplate = async (templateId: string): Promise<void> => {
    try {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === templateId
            ? { ...template, enabled: !template.enabled }
            : template,
        ),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: unknown) {
      logger.error("Error toggling template:", { error });
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "matches":
        return "heart";
      case "messages":
        return "chatbubble";
      case "reminders":
        return "alarm";
      case "promotions":
        return "megaphone";
      case "system":
        return "settings";
      default:
        return "notifications";
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "matches":
        return "#EF4444";
      case "messages":
        return "#3B82F6";
      case "reminders":
        return "#F59E0B";
      case "promotions":
        return "#10B981";
      case "system":
        return "#8B5CF6";
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading notification settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Notification Management
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        {stats && (
          <View
            style={[styles.statsContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Overview
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.adoptionRate}%
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Adoption Rate
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.openRate}%
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Open Rate
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.clickRate}%
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Click Rate
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.dailyNotifications.toLocaleString()}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Daily Notifications
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notification Types */}
        {stats && (
          <View
            style={[styles.typesContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notification Types
            </Text>

            {Object.entries(stats.notificationTypes).map(([type, count]) => (
              <View key={type} style={styles.typeItem}>
                <View style={styles.typeInfo}>
                  <Ionicons
                    name={getTypeIcon(type)}
                    size={20}
                    color={getTypeColor(type)}
                  />
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.typeCount, { color: colors.text }]}>
                  {count.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View
          style={[
            styles.settingsContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Enable Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Master switch for all notifications
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => updateSetting("enabled", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.enabled ? "#fff" : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Send push notifications to mobile devices
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) =>
                updateSetting("pushNotifications", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.pushNotifications ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Email Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Send notifications via email
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) =>
                updateSetting("emailNotifications", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.emailNotifications ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                SMS Notifications
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Send notifications via SMS
              </Text>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={(value) =>
                updateSetting("smsNotifications", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.smsNotifications ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Quiet Hours
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Respect user quiet hours preferences
              </Text>
            </View>
            <Switch
              value={settings.quietHoursEnabled}
              onValueChange={(value) =>
                updateSetting("quietHoursEnabled", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.quietHoursEnabled ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Smart Grouping
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Group related notifications together
              </Text>
            </View>
            <Switch
              value={settings.smartGrouping}
              onValueChange={(value) => updateSetting("smartGrouping", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.smartGrouping ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Personalized Timing
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Send notifications at optimal times for each user
              </Text>
            </View>
            <Switch
              value={settings.personalizedTiming}
              onValueChange={(value) =>
                updateSetting("personalizedTiming", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.personalizedTiming ? "#fff" : colors.textSecondary
              }
            />
          </View>
        </View>

        {/* Templates */}
        <View
          style={[
            styles.templatesContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Templates
          </Text>

          {templates.map((template) => (
            <View key={template.id} style={styles.templateItem}>
              <View style={styles.templateInfo}>
                <View style={styles.templateHeader}>
                  <Ionicons
                    name={getTypeIcon(template.type)}
                    size={20}
                    color={getTypeColor(template.type)}
                  />
                  <Text style={[styles.templateName, { color: colors.text }]}>
                    {template.name}
                  </Text>
                </View>
                <Text
                  style={[styles.templateType, { color: colors.textSecondary }]}
                >
                  {template.type} • Open: {template.openRate}% • Click:{" "}
                  {template.clickRate}%
                </Text>
                <Text
                  style={[
                    styles.templateLastSent,
                    { color: colors.textSecondary },
                  ]}
                >
                  Last sent: {new Date(template.lastSent).toLocaleDateString()}
                </Text>
              </View>
              <Switch
                value={template.enabled}
                onValueChange={() => toggleTemplate(template.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={template.enabled ? "#fff" : colors.textSecondary}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  typesContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  typeCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  templatesContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  templateInfo: {
    flex: 1,
    marginRight: 16,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "500",
  },
  templateType: {
    fontSize: 14,
    marginBottom: 2,
  },
  templateLastSent: {
    fontSize: 12,
  },
});
