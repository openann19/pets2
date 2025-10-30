/**
 * Admin Analytics Screen for Mobile
 * Comprehensive analytics dashboard with real-time data visualization
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useMemo, useEffect, useState } from "react";
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

interface AnalyticsApiResponse {
  users?: {
    total?: number;
    active?: number;
    suspended?: number;
    banned?: number;
    verified?: number;
    recent24h?: number;
    growth?: number;
    trend?: "up" | "down" | "stable";
  };
  pets?: {
    total?: number;
    active?: number;
    recent24h?: number;
    growth?: number;
    trend?: "up" | "down" | "stable";
  };
  matches?: {
    total?: number;
    active?: number;
    blocked?: number;
    recent24h?: number;
    growth?: number;
    trend?: "up" | "down" | "stable";
  };
  messages?: {
    total?: number;
    deleted?: number;
    recent24h?: number;
    growth?: number;
    trend?: "up" | "down" | "stable";
  };
}

interface AnalyticsData extends AnalyticsApiResponse {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
    growth: number;
    trend: "up" | "down" | "stable";
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
    growth: number;
    trend: "up" | "down" | "stable";
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
    growth: number;
    trend: "up" | "down" | "stable";
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
    growth: number;
    trend: "up" | "down" | "stable";
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    conversionRate: number;
    churnRate: number;
  };
  timeSeries: {
    date: string;
    users: number;
    matches: number;
    messages: number;
    revenue: number;
  }[];
  topPerformers: {
    users: {
      id: string;
      name: string;
      matches: number;
      messages: number;
    }[];
    pets: {
      id: string;
      name: string;
      breed: string;
      likes: number;
      matches: number;
    }[];
  };
  geographic: {
    country: string;
    users: number;
    percentage: number;
  }[];
  devices: {
    platform: string;
    count: number;
    percentage: number;
  }[];
  security: {
    suspiciousLogins: number;
    blockedIPs: number;
    reportedContent: number;
    bannedUsers: number;
  };
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      flex: 1,
      textAlign: "center",
    },
    periodSelector: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    periodButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    periodButtonActive: {
      // Active state handled by backgroundColor
    },
    periodText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    metricCard: {
      width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    metricHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    metricTitle: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginLeft: theme.spacing.xs,
    },
    metricValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
    metricTrend: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    metricTrendText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
    metricSubtext: {
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs,
    },
    engagementGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    engagementCard: {
      width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      ...theme.shadows.elevation2,
    },
    engagementLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    engagementValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
    revenueGrid: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    revenueCard: {
      flex: 1,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      ...theme.shadows.elevation2,
    },
    revenueLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    revenueValue: {
      fontSize: theme.typography.h2.size * 0.75,
      fontWeight: theme.typography.h1.weight,
    },
    securityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    securityCard: {
      width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      ...theme.shadows.elevation2,
    },
    securityLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      textAlign: "center",
    },
    securityValue: {
      fontSize: theme.typography.h2.size * 0.75,
      fontWeight: theme.typography.h1.weight,
    },
    performersGrid: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    performersCard: {
      flex: 1,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    performersTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.sm,
    },
    performerItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    performerRank: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
      width: 20,
    },
    performerName: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
      flex: 1,
    },
    performerStats: {
      fontSize: theme.typography.body.size * 0.75,
    },
  });
}

export default function AdminAnalyticsScreen({
  navigation,
}: AdminScreenProps<"AdminAnalytics">): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user: _user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d",
  );

  useEffect(() => {
    void loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ period: selectedPeriod });
      // Merge response data into full AnalyticsData structure
      const responseData: AnalyticsApiResponse = response.data || {};
      const fullData: AnalyticsData = {
        users: {
          total: responseData.users?.total || 0,
          active: responseData.users?.active || 0,
          suspended: responseData.users?.suspended || 0,
          banned: responseData.users?.banned || 0,
          verified: responseData.users?.verified || 0,
          recent24h: responseData.users?.recent24h || 0,
          growth: responseData.users?.growth || 0,
          trend: responseData.users?.trend || "stable",
        },
        pets: {
          total: responseData.pets?.total || 0,
          active: responseData.pets?.active || 0,
          recent24h: responseData.pets?.recent24h || 0,
          growth: responseData.pets?.growth || 0,
          trend: responseData.pets?.trend || "stable",
        },
        matches: {
          total: responseData.matches?.total || 0,
          active: responseData.matches?.active || 0,
          blocked: responseData.matches?.blocked || 0,
          recent24h: responseData.matches?.recent24h || 0,
          growth: responseData.matches?.growth || 0,
          trend: responseData.matches?.trend || "stable",
        },
        messages: {
          total: responseData.messages?.total || 0,
          deleted: responseData.messages?.deleted || 0,
          recent24h: responseData.messages?.recent24h || 0,
          growth: responseData.messages?.growth || 0,
          trend: responseData.messages?.trend || "stable",
        },
        engagement: {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          retentionRate: 0,
        },
        revenue: {
          totalRevenue: 0,
          monthlyRecurringRevenue: 0,
          averageRevenuePerUser: 0,
          conversionRate: 0,
          churnRate: 0,
        },
        timeSeries: [],
        topPerformers: {
          users: [],
          pets: [],
        },
        geographic: [],
        devices: [],
        security: {
          suspiciousLogins: 0,
          blockedIPs: 0,
          reportedContent: 0,
          bannedUsers: 0,
        },
      };
      setAnalytics(fullData);
    } catch (error: unknown) {
      logger.error("Error loading analytics data:", { error });
      Alert.alert("Error", "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handlePeriodChange = (period: "7d" | "30d" | "90d"): void => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPeriod(period);
  };

  const getTrendIcon = (trend: "up" | "down" | "stable"): string => {
    switch (trend) {
      case "up":
        return "trending-up";
      case "down":
        return "trending-down";
      default:
        return "remove";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable"): string => {
    switch (trend) {
      case "up":
        return theme.colors.success;
      case "down":
        return theme.colors.danger;
      default:
        return theme.colors.border;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.bg }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurface },
            ]}
          >
            Loading analytics...
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
          <TouchableOpacity
             testID="AdminAnalyticsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button"            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Analytics Dashboard
          </Text>
          <View style={styles.periodSelector}>
            {(["7d", "30d", "90d"] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                  {
                    backgroundColor:
                      selectedPeriod === period ? theme.colors.primary : theme.colors.surface,
                  },
                ]}
                 testID="AdminAnalyticsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  handlePeriodChange(period);
                }}
              >
                <Text
                style={[
                  styles.periodText,
                  {
                    color:
                      selectedPeriod === period ? theme.colors.onPrimary : theme.colors.onSurface,
                  },
                ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {analytics ? (
          <>
            {/* Key Metrics */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Key Metrics
              </Text>
              <View style={styles.metricsGrid}>
                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="people" size={20} color={theme.colors.info} />
                    <Text
                      style={[
                        styles.metricTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Users
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.users.total)}
                  </Text>
                  <View style={styles.metricTrend}>
                    <Ionicons
                      name={getTrendIcon(analytics.users.trend)}
                      size={16}
                      color={getTrendColor(analytics.users.trend)}
                    />
                    <Text
                      style={[
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.users.trend) },
                      ]}
                    >
                      {analytics.users.growth > 0 ? "+" : ""}
                      {analytics.users.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="heart" size={20} color={theme.colors.primary} />
                    <Text
                      style={[
                        styles.metricTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Matches
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.matches.total)}
                  </Text>
                  <View style={styles.metricTrend}>
                    <Ionicons
                      name={getTrendIcon(analytics.matches.trend)}
                      size={16}
                      color={getTrendColor(analytics.matches.trend)}
                    />
                    <Text
                      style={[
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.matches.trend) },
                      ]}
                    >
                      {analytics.matches.growth > 0 ? "+" : ""}
                      {analytics.matches.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
                    <Text
                      style={[
                        styles.metricTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Messages
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.messages.total)}
                  </Text>
                  <View style={styles.metricTrend}>
                    <Ionicons
                      name={getTrendIcon(analytics.messages.trend)}
                      size={16}
                      color={getTrendColor(analytics.messages.trend)}
                    />
                    <Text
                      style={[
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.messages.trend) },
                      ]}
                    >
                      {analytics.messages.growth > 0 ? "+" : ""}
                      {analytics.messages.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="cash" size={20} color={theme.colors.success} />
                    <Text
                      style={[
                        styles.metricTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Revenue
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatCurrency(analytics.revenue.totalRevenue)}
                  </Text>
                  <Text
                    style={[
                      styles.metricSubtext,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    MRR:{" "}
                    {formatCurrency(analytics.revenue.monthlyRecurringRevenue)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Engagement Metrics */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Engagement
              </Text>
              <View style={styles.engagementGrid}>
                <View
                  style={[
                    styles.engagementCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.engagementLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    DAU
                  </Text>
                  <Text
                    style={[
                      styles.engagementValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.engagement.dailyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.engagementCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.engagementLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    WAU
                  </Text>
                  <Text
                    style={[
                      styles.engagementValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.engagement.weeklyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.engagementCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.engagementLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    MAU
                  </Text>
                  <Text
                    style={[
                      styles.engagementValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatNumber(analytics.engagement.monthlyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.engagementCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.engagementLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Session
                  </Text>
                  <Text
                    style={[
                      styles.engagementValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {Math.round(analytics.engagement.averageSessionDuration)}m
                  </Text>
                </View>
              </View>
            </View>

            {/* Revenue Metrics */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Revenue Analytics
              </Text>
              <View style={styles.revenueGrid}>
                <View
                  style={[
                    styles.revenueCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.revenueLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    ARPU
                  </Text>
                  <Text
                    style={[
                      styles.revenueValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {formatCurrency(analytics.revenue.averageRevenuePerUser)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.revenueCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.revenueLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Conversion
                  </Text>
                  <Text
                    style={[
                      styles.revenueValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {analytics.revenue.conversionRate.toFixed(1)}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.revenueCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.revenueLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Churn
                  </Text>
                  <Text
                    style={[
                      styles.revenueValue,
                      { color: theme.colors.danger },
                    ]}
                  >
                    {analytics.revenue.churnRate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Security Metrics */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Security Overview
              </Text>
              <View style={styles.securityGrid}>
                <View
                  style={[
                    styles.securityCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Ionicons name="warning" size={20} color={theme.colors.warning} />
                  <Text
                    style={[
                      styles.securityLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Suspicious Logins
                  </Text>
                  <Text
                    style={[
                      styles.securityValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {analytics.security.suspiciousLogins}
                  </Text>
                </View>
                <View
                  style={[
                    styles.securityCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Ionicons name="shield" size={20} color={theme.colors.danger} />
                  <Text
                    style={[
                      styles.securityLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Blocked IPs
                  </Text>
                  <Text
                    style={[
                      styles.securityValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {analytics.security.blockedIPs}
                  </Text>
                </View>
                <View
                  style={[
                    styles.securityCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Ionicons name="flag" size={20} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.securityLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Reported Content
                  </Text>
                  <Text
                    style={[
                      styles.securityValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {analytics.security.reportedContent}
                  </Text>
                </View>
                <View
                  style={[
                    styles.securityCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Ionicons name="ban" size={20} color={theme.colors.danger} />
                  <Text
                    style={[
                      styles.securityLabel,
                      { color: theme.colors.onMuted },
                    ]}
                  >
                    Banned Users
                  </Text>
                  <Text
                    style={[
                      styles.securityValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {analytics.security.bannedUsers}
                  </Text>
                </View>
              </View>
            </View>

            {/* Top Performers */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Top Performers
              </Text>
              <View style={styles.performersGrid}>
                <View
                  style={[
                    styles.performersCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.performersTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Top Users
                  </Text>
                  {analytics.topPerformers.users
                    .slice(0, 3)
                    .map((user, index) => (
                      <View key={user.id} style={styles.performerItem}>
                        <Text
                          style={[
                            styles.performerRank,
                            { color: theme.colors.onMuted },
                          ]}
                        >
                          #{index + 1}
                        </Text>
                        <Text
                          style={[
                            styles.performerName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {user.name}
                        </Text>
                        <Text
                          style={[
                            styles.performerStats,
                            { color: theme.colors.onMuted },
                          ]}
                        >
                          {user.matches} matches
                        </Text>
                      </View>
                    ))}
                </View>
                <View
                  style={[
                    styles.performersCard,
                    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.performersTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Top Pets
                  </Text>
                  {analytics.topPerformers.pets
                    .slice(0, 3)
                    .map((pet, index) => (
                      <View key={pet.id} style={styles.performerItem}>
                        <Text
                          style={[
                            styles.performerRank,
                            { color: theme.colors.onMuted },
                          ]}
                        >
                          #{index + 1}
                        </Text>
                        <Text
                          style={[
                            styles.performerName,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          {pet.name}
                        </Text>
                        <Text
                          style={[
                            styles.performerStats,
                            { color: theme.colors.onMuted },
                          ]}
                        >
                          {pet.matches} matches
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

