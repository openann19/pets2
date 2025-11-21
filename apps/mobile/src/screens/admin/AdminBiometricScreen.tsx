/**
 * Admin Biometric Management Screen for Mobile
 * Management interface for biometric authentication settings
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

interface BiometricSettings {
  enabled: boolean;
  requireForLogin: boolean;
  requireForSensitiveActions: boolean;
  allowFaceId: boolean;
  allowTouchId: boolean;
  allowFingerprint: boolean;
  sessionTimeout: number;
  maxAttempts: number;
}

interface BiometricStats {
  totalUsers: number;
  enabledUsers: number;
  adoptionRate: number;
  dailyLogins: number;
  failedAttempts: number;
  deviceTypes: {
    faceId: number;
    touchId: number;
    fingerprint: number;
  };
}

export default function AdminBiometricScreen({
  navigation,
}: AdminScreenProps<"AdminBiometric">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [settings, setSettings] = useState<BiometricSettings>({
    enabled: true,
    requireForLogin: true,
    requireForSensitiveActions: true,
    allowFaceId: true,
    allowTouchId: true,
    allowFingerprint: true,
    sessionTimeout: 300, // 5 minutes
    maxAttempts: 3,
  });
  const [stats, setStats] = useState<BiometricStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadBiometricData();
  }, []);

  const loadBiometricData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockStats: BiometricStats = {
        totalUsers: 2800,
        enabledUsers: 1250,
        adoptionRate: 45,
        dailyLogins: 890,
        failedAttempts: 23,
        deviceTypes: {
          faceId: 450,
          touchId: 620,
          fingerprint: 180,
        },
      };

      setStats(mockStats);
    } catch (error: unknown) {
      logger.error("Error loading biometric data:", { error });
      Alert.alert("Error", "Failed to load biometric data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadBiometricData();
    setRefreshing(false);
  };

  const updateSetting = (
    key: keyof BiometricSettings,
    value: boolean | number,
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveSettings = async (): Promise<void> => {
    try {
      // TODO: Implement API call to save settings
      Alert.alert("Success", "Biometric settings saved successfully");
    } catch (error: unknown) {
      logger.error("Error saving biometric settings:", { error });
      Alert.alert("Error", "Failed to save biometric settings");
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
            Loading biometric settings...
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
            Biometric Management
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
                  {stats.enabledUsers.toLocaleString()}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Enabled Users
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.dailyLogins.toLocaleString()}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Daily Logins
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {stats.failedAttempts}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Failed Attempts
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Device Types */}
        {stats && (
          <View
            style={[
              styles.deviceTypesContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Device Types
            </Text>

            <View style={styles.deviceTypeItem}>
              <View style={styles.deviceTypeInfo}>
                <Ionicons name="phone-portrait" size={20} color="#3B82F6" />
                <Text style={[styles.deviceTypeName, { color: colors.text }]}>
                  Face ID
                </Text>
              </View>
              <Text style={[styles.deviceTypeCount, { color: colors.text }]}>
                {stats.deviceTypes.faceId.toLocaleString()}
              </Text>
            </View>

            <View style={styles.deviceTypeItem}>
              <View style={styles.deviceTypeInfo}>
                <Ionicons name="finger-print" size={20} color="#10B981" />
                <Text style={[styles.deviceTypeName, { color: colors.text }]}>
                  Touch ID
                </Text>
              </View>
              <Text style={[styles.deviceTypeCount, { color: colors.text }]}>
                {stats.deviceTypes.touchId.toLocaleString()}
              </Text>
            </View>

            <View style={styles.deviceTypeItem}>
              <View style={styles.deviceTypeInfo}>
                <Ionicons name="scan" size={20} color="#F59E0B" />
                <Text style={[styles.deviceTypeName, { color: colors.text }]}>
                  Fingerprint
                </Text>
              </View>
              <Text style={[styles.deviceTypeCount, { color: colors.text }]}>
                {stats.deviceTypes.fingerprint.toLocaleString()}
              </Text>
            </View>
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
                Enable Biometric Authentication
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Allow users to use biometric authentication
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
                Require for Login
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Force biometric authentication for login
              </Text>
            </View>
            <Switch
              value={settings.requireForLogin}
              onValueChange={(value) => updateSetting("requireForLogin", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.requireForLogin ? "#fff" : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Require for Sensitive Actions
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Require biometric for payments and account changes
              </Text>
            </View>
            <Switch
              value={settings.requireForSensitiveActions}
              onValueChange={(value) =>
                updateSetting("requireForSensitiveActions", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.requireForSensitiveActions
                  ? "#fff"
                  : colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Allow Face ID
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Enable Face ID authentication
              </Text>
            </View>
            <Switch
              value={settings.allowFaceId}
              onValueChange={(value) => updateSetting("allowFaceId", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.allowFaceId ? "#fff" : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Allow Touch ID
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Enable Touch ID authentication
              </Text>
            </View>
            <Switch
              value={settings.allowTouchId}
              onValueChange={(value) => updateSetting("allowTouchId", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.allowTouchId ? "#fff" : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Allow Fingerprint
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Enable fingerprint authentication
              </Text>
            </View>
            <Switch
              value={settings.allowFingerprint}
              onValueChange={(value) =>
                updateSetting("allowFingerprint", value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={
                settings.allowFingerprint ? "#fff" : colors.textSecondary
              }
            />
          </View>
        </View>

        {/* Security Settings */}
        <View
          style={[
            styles.securityContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Security
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Session Timeout (seconds)
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                How long before biometric session expires
              </Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.valueText, { color: colors.primary }]}>
                {settings.sessionTimeout}
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, { color: colors.text }]}>
                Max Failed Attempts
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Maximum failed attempts before lockout
              </Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.valueText, { color: colors.primary }]}>
                {settings.maxAttempts}
              </Text>
            </View>
          </View>
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
  deviceTypesContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  deviceTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceTypeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  deviceTypeCount: {
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
  securityContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
