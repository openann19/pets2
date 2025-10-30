/**
 * Admin Dashboard Screen for Mobile
 * Professional admin interface for mobile devices
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useMemo, useEffect, useState, useCallback } from "react";
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
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";
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

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    header: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    card: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    cardTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginLeft: theme.spacing.xs,
    },
    healthInfo: {
      gap: theme.spacing.xs,
    },
    healthStatus: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
    healthDetails: {
      fontSize: theme.typography.body.size * 0.875,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    quickActionCard: {
      width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      ...theme.shadows.elevation2,
    },
    quickActionTitle: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
    statCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.elevation2,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    statTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginLeft: theme.spacing.xs,
    },
    statNumber: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
    statDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    statDetail: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
    },
  });
}

export default function AdminDashboardScreen({
  navigation,
}: AdminScreenProps<"AdminDashboard">): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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

  const handleQuickAction = useCallback((action: string): void => {
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
  }, [navigation]);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "healthy":
        return theme.colors.success;
      case "warning":
        return theme.colors.warning;
      case "error":
        return theme.colors.danger;
      default:
        return theme.colors.border;
    }
  }, [theme]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.bg }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.onSurface }]}
          >
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Admin Dashboard
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.onMuted },
            ]}
          >
            Welcome, {_user?.firstName} {_user?.lastName}
          </Text>
        </View>

        {/* System Health */}
        {systemHealth ? (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="server-outline"
                size={24}
                color={getStatusColor(systemHealth.status)}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                System Status
              </Text>
            </View>
            <View style={styles.healthInfo}>
              <Text
                style={[
                  styles.healthStatus,
                  { color: getStatusColor(systemHealth.status) },
                ]}
              >
                {systemHealth.status.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.healthDetails,
                  { color: theme.colors.onMuted },
                ]}
              >
                Uptime: {Math.floor(systemHealth.uptime / 3600)}h{" "}
                {Math.floor((systemHealth.uptime % 3600) / 60)}m
              </Text>
              <Text
                style={[
                  styles.healthDetails,
                  { color: theme.colors.onMuted },
                ]}
              >
                Database: {systemHealth.database.status}
              </Text>
              <Text
                style={[
                  styles.healthDetails,
                  { color: theme.colors.onMuted },
                ]}
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
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface },
            ]}
          >
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("analytics");
              }}
            >
              <Ionicons name="analytics-outline" size={32} color={theme.colors.info} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("users");
              }}
            >
              <Ionicons name="people-outline" size={32} color={theme.colors.primary} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("security");
              }}
            >
              <Ionicons name="shield-outline" size={32} color={theme.colors.danger} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Security
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("billing");
              }}
            >
              <Ionicons name="card-outline" size={32} color={theme.colors.success} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Billing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("chats");
              }}
            >
              <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.warning} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Chats
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("uploads");
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.info} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Uploads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("verifications");
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.success} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Verifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
               testID="AdminDashboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleQuickAction("services");
              }}
            >
              <Ionicons name="server-outline" size={32} color={theme.colors.primary} />
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: theme.colors.onSurface },
                ]}
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
              style={[
                styles.sectionTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Platform Statistics
            </Text>

            {/* Users Stats */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
            >
              <View style={styles.statHeader}>
                <Ionicons name="people" size={24} color={theme.colors.info} />
                <Text
                  style={[
                    styles.statTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Users
                </Text>
              </View>
              <Text
                style={[
                  styles.statNumber,
                  { color: theme.colors.onSurface },
                ]}
              >
                {stats.users.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.onMuted },
                  ]}
                >
                  Active: {stats.users.active}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.onMuted },
                  ]}
                >
                  Verified: {stats.users.verified}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.warning },
                  ]}
                >
                  Suspended: {stats.users.suspended}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.danger },
                  ]}
                >
                  Banned: {stats.users.banned}
                </Text>
              </View>
            </View>

            {/* Pets Stats */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
            >
              <View style={styles.statHeader}>
                <Ionicons name="paw" size={24} color={theme.colors.success} />
                <Text
                  style={[
                    styles.statTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Pets
                </Text>
              </View>
              <Text
                style={[
                  styles.statNumber,
                  { color: theme.colors.onSurface },
                ]}
              >
                {stats.pets.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.onMuted },
                  ]}
                >
                  Active: {stats.pets.active}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.success },
                  ]}
                >
                  +{stats.pets.recent24h} today
                </Text>
              </View>
            </View>

            {/* Matches Stats */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
            >
              <View style={styles.statHeader}>
                <Ionicons name="heart" size={24} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.statTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Matches
                </Text>
              </View>
              <Text
                style={[
                  styles.statNumber,
                  { color: theme.colors.onSurface },
                ]}
              >
                {stats.matches.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.onMuted },
                  ]}
                >
                  Active: {stats.matches.active}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.danger },
                  ]}
                >
                  Blocked: {stats.matches.blocked}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.success },
                  ]}
                >
                  +{stats.matches.recent24h} today
                </Text>
              </View>
            </View>

            {/* Messages Stats */}
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
              ]}
            >
              <View style={styles.statHeader}>
                <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.statTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Messages
                </Text>
              </View>
              <Text
                style={[
                  styles.statNumber,
                  { color: theme.colors.onSurface },
                ]}
              >
                {stats.messages.total.toLocaleString()}
              </Text>
              <View style={styles.statDetails}>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.onMuted },
                  ]}
                >
                  Deleted: {stats.messages.deleted}
                </Text>
                <Text
                  style={[
                    styles.statDetail,
                    { color: theme.colors.success },
                  ]}
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

