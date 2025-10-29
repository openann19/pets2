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
import { useTheme } from '@/theme'";
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
  const colors = theme.colors;
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
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return theme.colors.danger;
      default:
        return theme.palette.neutral[500];
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
              { color: colors.onSurface},
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
            style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
          >
            Admin Dashboard
          </Text>
          <Text
            style={StyleSheet.flatten([
              styles.subtitle,
              { color: colors.onSurfaceecondary },
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
                  { color: colors.onSurface},
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
                  { color: colors.onSurfaceecondary },
                ])}
              >
                Uptime: {Math.floor(systemHealth.uptime / 3600)}h{" "}
                {Math.floor((systemHealth.uptime % 3600) / 60)}m
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.healthDetails,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                Database: {systemHealth.database.status}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.healthDetails,
                  { color: colors.onSurfaceecondary },
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
              { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("analytics");
              }}
            >
              <Ionicons name="analytics-outline" size={32} color={colors.info} />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("users");
              }}
            >
              <Ionicons name="people-outline" size={32} color={theme.colors.primary} />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("security");
              }}
            >
              <Ionicons name="shield-outline" size={32} color={theme.colors.danger} />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("billing");
              }}
            >
              <Ionicons name="card-outline" size={32} color={colors.success} />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("chats");
              }}
            >
              ?{" "}
              <Ionicons name="chatbubbles-outline" size={32} color={colors.warning} />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("uploads");
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#06B6D4" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("verifications");
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color="#10B981" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("services");
              }}
            >
              <Ionicons name="server-outline" size={32} color="#8b5cf6" />
              <Text
                style={StyleSheet.flatten([
                  styles.quickActionTitle,
                  { color: colors.onSurface},
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
                { color: colors.onSurface},
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
                <Ionicons name="people" size={24} color={colors.info} />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Users
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.onSurface},
                ])}
              >
                {stats.users.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Active: {stats.users.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Verified: {stats.users.verified}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.warning },
                  ])}
                >
                  Suspended: {stats.users.suspended}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: theme.colors.danger },
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
                <Ionicons name="paw" size={24} color={colors.success} />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Pets
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.onSurface},
                ])}
              >
                {stats.pets.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Active: {stats.pets.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.success },
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
                <Ionicons name="heart" size={24} color={colors.primary} />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Matches
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.onSurface},
                ])}
              >
                {stats.matches.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Active: {stats.matches.active}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: theme.colors.danger },
                  ])}
                >
                  Blocked: {stats.matches.blocked}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.success },
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
                <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />
                <Text
                  style={StyleSheet.flatten([
                    styles.statTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Messages
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.statNumber,
                  { color: colors.onSurface},
                ])}
              >
                {stats.messages.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Deleted: {stats.messages.deleted}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.statDetail,
                    { color: colors.success },
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
