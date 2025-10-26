/**
 * Admin Dashboard Screen for Mobile
 * Professional admin interface for mobile devices
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/Provider";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";
import { getExtendedColors, type ExtendedColors } from '../../theme/adapters';
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
  };
}

interface SystemHealth {
  status: string;
  uptime: number;
  database: {
    status: string;
    connected: boolean;
  };
  memory: {
    used: number;
    total: number;
    external: number;
  };
  environment: string;
}

export default function AdminDashboardScreen({
  navigation,
}: AdminScreenProps<"AdminDashboard">): React.JSX.Element {
  const theme = useTheme();
  const colors: ExtendedColors = getExtendedColors(theme);
  const { user: _user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [statsResponse, healthResponse] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getSystemHealth(),
      ]);

      setStats(statsResponse.data);
      setSystemHealth(healthResponse.data);
    } catch (error: unknown) {
      logger.error("Error loading dashboard data:", { error });
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string): void => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (action) {
      case "analytics":
        navigation.navigate("AdminAnalytics");
        break;
      case "users":
        navigation.navigate("AdminUsers");
        break;
      case "security":
        navigation.navigate("AdminSecurity");
        break;
      case "billing":
        navigation.navigate("AdminBilling");
        break;
      case "chats":
        navigation.navigate("AdminChats");
        break;
      case "uploads":
        navigation.navigate("AdminUploads");
        break;
      case "verifications":
        navigation.navigate("AdminVerifications");
        break;
      case "services":
        navigation.navigate("AdminServices");
        break;
      default:
        logger.info(`Quick action: ${action}`);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
        return "Theme.colors.status.success";
      case "warning":
        return "Theme.colors.status.warning";
      case "error":
        return "Theme.colors.status.error";
      default:
        return "Theme.colors.neutral[500]";
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.background },
        ])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.text },
            ])}
          >
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.text }])}
          >
            Admin Dashboard
          </Text>
          <Text
            style={StyleSheet.flatten([
              styles.subtitle,
              { color: colors.textSecondary },
            ])}
          >
            Welcome, {_user?.firstName} {_user?.lastName}
          </Text>
        </View>

        {/* System Health */}
        {systemHealth ? (
          <View
            style={StyleSheet.flatten([
              styles.card,
              { backgroundColor: colors.card },
            ])}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="server-outline"
                size={24}
                color={getStatusColor(systemHealth.status)}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.cardTitle,
                  { color: colors.text },
                ])}
              >
                System Status
              </Text>
            </View>
            <View style={styles.healthInfo}>
              <Text
                style={StyleSheet.flatten([
                  styles.healthStatus,
                  { color: getStatusColor(systemHealth.status) },
                ])}
              >
                {systemHealth.status.toUpperCase()}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.healthDetails,
                  { color: colors.textSecondary },
                ])}
              >
                Uptime: {Math.floor(systemHealth.uptime / 3600)}h{" "}
                {Math.floor((systemHealth.uptime % 3600) / 60)}m
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.healthDetails,
                  { color: colors.textSecondary },
                ])}
              >
                Database: {systemHealth.database.status}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.healthDetails,
                  { color: colors.textSecondary },
                ])}
              >
                Memory: {systemHealth.memory.used}MB /{" "}
                {systemHealth.memory.total}MB
              </Text>
            </View>
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: colors.text },
            ])}
          >
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("analytics");
              }}
            >
              <Ionicons name="analytics-outline" size={32} color="Theme.colors.status.info" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("users");
              }}
            >
              <Ionicons name="people-outline" size={32} color="Theme.colors.secondary[500]" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("security");
              }}
            >
              <Ionicons name="shield-outline" size={32} color="Theme.colors.status.error" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Security
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("billing");
              }}
            >
              <Ionicons name="card-outline" size={32} color="Theme.colors.status.success" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Billing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("chats");
              }}
            >
              ?{" "}
              <Ionicons name="chatbubbles-outline" size={32} color="Theme.colors.status.warning" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Chats
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("uploads");
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#06B6D4" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Uploads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("verifications");
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color="#10B981" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Verifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionCard,
                { backgroundColor: colors.card },
              ])}
              onPress={() => {
                handleQuickAction("services");
              }}
            >
              <Ionicons name="server-outline" size={32} color="#8b5cf6" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.text },
                ])}
              >
                Services
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        {stats ? (
          <View style={styles.section}>
            <Text
              style={StyleSheet.flatten([
                styles.sectionTitle,
                { color: colors.text },
              ])}
            >
              Platform Statistics
            </Text>

            {/* Users Stats */}
            <View
              style={StyleSheet.flatten([
                styles.statCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.statHeader}>
                <Ionicons name="people" size={24} color="Theme.colors.status.info" />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.text },
                  ])}
                >
                  Users
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.text },
                ])}
              >
                {stats.users.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.textSecondary },
                  ])}
                >
                  Active: {stats.users.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.textSecondary },
                  ])}
                >
                  Verified: {stats.users.verified}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.warning" },
                  ])}
                >
                  Suspended: {stats.users.suspended}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.error" },
                  ])}
                >
                  Banned: {stats.users.banned}
                </Text>
              </View>
            </View>

            {/* Pets Stats */}
            <View
              style={StyleSheet.flatten([
                styles.statCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.statHeader}>
                <Ionicons name="paw" size={24} color="Theme.colors.status.success" />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.text },
                  ])}
                >
                  Pets
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.text },
                ])}
              >
                {stats.pets.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.textSecondary },
                  ])}
                >
                  Active: {stats.pets.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.success" },
                  ])}
                >
                  +{stats.pets.recent24h} today
                </Text>
              </View>
            </View>

            {/* Matches Stats */}
            <View
              style={StyleSheet.flatten([
                styles.statCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.statHeader}>
                <Ionicons name="heart" size={24} color="Theme.colors.primary[500]" />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.text },
                  ])}
                >
                  Matches
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.text },
                ])}
              >
                {stats.matches.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.textSecondary },
                  ])}
                >
                  Active: {stats.matches.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.error" },
                  ])}
                >
                  Blocked: {stats.matches.blocked}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.success" },
                  ])}
                >
                  +{stats.matches.recent24h} today
                </Text>
              </View>
            </View>

            {/* Messages Stats */}
            <View
              style={StyleSheet.flatten([
                styles.statCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.statHeader}>
                <Ionicons name="chatbubble" size={24} color="Theme.colors.secondary[500]" />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.text },
                  ])}
                >
                  Messages
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.text },
                ])}
              >
                {stats.messages.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.textSecondary },
                  ])}
                >
                  Deleted: {stats.messages.deleted}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: "Theme.colors.status.success" },
                  ])}
                >
                  +{stats.messages.recent24h} today
                </Text>
              </View>
            </View>
          </View>
        ) : null}
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
    fontWeight: "500",
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  healthInfo: {
    gap: 4,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  healthDetails: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  statCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statDetail: {
    fontSize: 12,
    fontWeight: "500",
  },
});
