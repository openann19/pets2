/**
 * Admin Analytics Screen for Mobile
 * Comprehensive analytics dashboard with real-time data visualization
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
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AnalyticsData {
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

export default function AdminAnalyticsScreen({
  navigation,
}: AdminScreenProps<"AdminAnalytics">): React.JSX.Element {
  const { colors } = useTheme();
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
      setAnalytics(response.data);
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
        return "#10B981";
      case "down":
        return "#EF4444";
      default:
        return "#6B7280";
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
            Loading analytics...
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
          <TouchableOpacity
            onPress={() => {
              (navigation as { goBack: () => void }).goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.text }])}
          >
            Analytics Dashboard
          </Text>
          <View style={styles.periodSelector}>
            {(["7d", "30d", "90d"] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={StyleSheet.flatten([
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                  {
                    backgroundColor:
                      selectedPeriod === period ? colors.primary : colors.card,
                  },
                ])}
                onPress={() => {
                  handlePeriodChange(period);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.periodText,
                    {
                      color:
                        selectedPeriod === period ? "#FFFFFF" : colors.text,
                    },
                  ])}
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
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.text },
                ])}
              >
                Key Metrics
              </Text>
              <View style={styles.metricsGrid}>
                <View
                  style={StyleSheet.flatten([
                    styles.metricCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="people" size={20} color="#3B82F6" />
                    <Text
                      style={StyleSheet.flatten([
                        styles.metricTitle,
                        { color: colors.text },
                      ])}
                    >
                      Users
                    </Text>
                  </View>
                  <Text
                    style={StyleSheet.flatten([
                      styles.metricValue,
                      { color: colors.text },
                    ])}
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
                      style={StyleSheet.flatten([
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.users.trend) },
                      ])}
                    >
                      {analytics.users.growth > 0 ? "+" : ""}
                      {analytics.users.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={StyleSheet.flatten([
                    styles.metricCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="heart" size={20} color="#EC4899" />
                    <Text
                      style={StyleSheet.flatten([
                        styles.metricTitle,
                        { color: colors.text },
                      ])}
                    >
                      Matches
                    </Text>
                  </View>
                  <Text
                    style={StyleSheet.flatten([
                      styles.metricValue,
                      { color: colors.text },
                    ])}
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
                      style={StyleSheet.flatten([
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.matches.trend) },
                      ])}
                    >
                      {analytics.matches.growth > 0 ? "+" : ""}
                      {analytics.matches.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={StyleSheet.flatten([
                    styles.metricCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="chatbubble" size={20} color="#8B5CF6" />
                    <Text
                      style={StyleSheet.flatten([
                        styles.metricTitle,
                        { color: colors.text },
                      ])}
                    >
                      Messages
                    </Text>
                  </View>
                  <Text
                    style={StyleSheet.flatten([
                      styles.metricValue,
                      { color: colors.text },
                    ])}
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
                      style={StyleSheet.flatten([
                        styles.metricTrendText,
                        { color: getTrendColor(analytics.messages.trend) },
                      ])}
                    >
                      {analytics.messages.growth > 0 ? "+" : ""}
                      {analytics.messages.growth}%
                    </Text>
                  </View>
                </View>

                <View
                  style={StyleSheet.flatten([
                    styles.metricCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <View style={styles.metricHeader}>
                    <Ionicons name="cash" size={20} color="#10B981" />
                    <Text
                      style={StyleSheet.flatten([
                        styles.metricTitle,
                        { color: colors.text },
                      ])}
                    >
                      Revenue
                    </Text>
                  </View>
                  <Text
                    style={StyleSheet.flatten([
                      styles.metricValue,
                      { color: colors.text },
                    ])}
                  >
                    {formatCurrency(analytics.revenue.totalRevenue)}
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.metricSubtext,
                      { color: colors.textSecondary },
                    ])}
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
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.text },
                ])}
              >
                Engagement
              </Text>
              <View style={styles.engagementGrid}>
                <View
                  style={StyleSheet.flatten([
                    styles.engagementCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    DAU
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementValue,
                      { color: colors.text },
                    ])}
                  >
                    {formatNumber(analytics.engagement.dailyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.engagementCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    WAU
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementValue,
                      { color: colors.text },
                    ])}
                  >
                    {formatNumber(analytics.engagement.weeklyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.engagementCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    MAU
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementValue,
                      { color: colors.text },
                    ])}
                  >
                    {formatNumber(analytics.engagement.monthlyActiveUsers)}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.engagementCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Session
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.engagementValue,
                      { color: colors.text },
                    ])}
                  >
                    {Math.round(analytics.engagement.averageSessionDuration)}m
                  </Text>
                </View>
              </View>
            </View>

            {/* Revenue Metrics */}
            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.text },
                ])}
              >
                Revenue Analytics
              </Text>
              <View style={styles.revenueGrid}>
                <View
                  style={StyleSheet.flatten([
                    styles.revenueCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    ARPU
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueValue,
                      { color: colors.text },
                    ])}
                  >
                    {formatCurrency(analytics.revenue.averageRevenuePerUser)}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.revenueCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Conversion
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueValue,
                      { color: colors.text },
                    ])}
                  >
                    {analytics.revenue.conversionRate.toFixed(1)}%
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.revenueCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Churn
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.revenueValue,
                      { color: "#EF4444" },
                    ])}
                  >
                    {analytics.revenue.churnRate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Security Metrics */}
            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.text },
                ])}
              >
                Security Overview
              </Text>
              <View style={styles.securityGrid}>
                <View
                  style={StyleSheet.flatten([
                    styles.securityCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Suspicious Logins
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityValue,
                      { color: colors.text },
                    ])}
                  >
                    {analytics.security.suspiciousLogins}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.securityCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Ionicons name="shield" size={20} color="#EF4444" />
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Blocked IPs
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityValue,
                      { color: colors.text },
                    ])}
                  >
                    {analytics.security.blockedIPs}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.securityCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Ionicons name="flag" size={20} color="#8B5CF6" />
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Reported Content
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityValue,
                      { color: colors.text },
                    ])}
                  >
                    {analytics.security.reportedContent}
                  </Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.securityCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Ionicons name="ban" size={20} color="#EF4444" />
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityLabel,
                      { color: colors.textSecondary },
                    ])}
                  >
                    Banned Users
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.securityValue,
                      { color: colors.text },
                    ])}
                  >
                    {analytics.security.bannedUsers}
                  </Text>
                </View>
              </View>
            </View>

            {/* Top Performers */}
            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.text },
                ])}
              >
                Top Performers
              </Text>
              <View style={styles.performersGrid}>
                <View
                  style={StyleSheet.flatten([
                    styles.performersCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.performersTitle,
                      { color: colors.text },
                    ])}
                  >
                    Top Users
                  </Text>
                  {analytics.topPerformers.users
                    .slice(0, 3)
                    .map((user, index) => (
                      <View key={user.id} style={styles.performerItem}>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerRank,
                            { color: colors.textSecondary },
                          ])}
                        >
                          #{index + 1}
                        </Text>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerName,
                            { color: colors.text },
                          ])}
                        >
                          {user.name}
                        </Text>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerStats,
                            { color: colors.textSecondary },
                          ])}
                        >
                          {user.matches} matches
                        </Text>
                      </View>
                    ))}
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.performersCard,
                    { backgroundColor: colors.card },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.performersTitle,
                      { color: colors.text },
                    ])}
                  >
                    Top Pets
                  </Text>
                  {analytics.topPerformers.pets
                    .slice(0, 3)
                    .map((pet, index) => (
                      <View key={pet.id} style={styles.performerItem}>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerRank,
                            { color: colors.textSecondary },
                          ])}
                        >
                          #{index + 1}
                        </Text>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerName,
                            { color: colors.text },
                          ])}
                        >
                          {pet.name}
                        </Text>
                        <Text
                          style={StyleSheet.flatten([
                            styles.performerStats,
                            { color: colors.textSecondary },
                          ])}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodButtonActive: {
    // Active state handled by backgroundColor
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  engagementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  engagementCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  engagementLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  engagementValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  revenueGrid: {
    flexDirection: "row",
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  securityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  securityCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  securityLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  securityValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  performersGrid: {
    flexDirection: "row",
    gap: 12,
  },
  performersCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  performersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  performerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  performerRank: {
    fontSize: 12,
    fontWeight: "600",
    width: 20,
  },
  performerName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  performerStats: {
    fontSize: 12,
  },
});
