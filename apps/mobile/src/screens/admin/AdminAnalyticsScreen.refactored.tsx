/**
 * Admin Analytics Screen for Mobile
 * Comprehensive analytics dashboard with real-time data visualization
 * REFACTORED: Extracted components to reduce complexity
 */

import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";
import {
  KeyMetricsSection,
  EngagementMetricsSection,
  RevenueMetricsSection,
  SecurityMetricsSection,
  TopPerformersSection,
} from "./analytics/components";
import { useTheme, getExtendedColors } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
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
});
}


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
    const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const colors = getExtendedColors(theme);
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
      const responseData = response.data || {};
      const fullData: AnalyticsData = {
        users: {
          total: responseData.users?.total || 0,
          active: responseData.users?.active || 0,
          suspended: responseData.users?.suspended || 0,
          banned: responseData.users?.banned || 0,
          verified: responseData.users?.verified || 0,
          recent24h: responseData.users?.recent24h || 0,
          growth: (responseData.users as any)?.growth || 0,
          trend: ((responseData.users as any)?.trend as "up" | "down" | "stable") || "stable",
        },
        pets: {
          total: responseData.pets?.total || 0,
          active: responseData.pets?.active || 0,
          recent24h: responseData.pets?.recent24h || 0,
          growth: (responseData.pets as any)?.growth || 0,
          trend: ((responseData.pets as any)?.trend as "up" | "down" | "stable") || "stable",
        },
        matches: {
          total: responseData.matches?.total || 0,
          active: responseData.matches?.active || 0,
          blocked: responseData.matches?.blocked || 0,
          recent24h: responseData.matches?.recent24h || 0,
          growth: (responseData.matches as any)?.growth || 0,
          trend: ((responseData.matches as any)?.trend as "up" | "down" | "stable") || "stable",
        },
        messages: {
          total: responseData.messages?.total || 0,
          deleted: responseData.messages?.deleted || 0,
          recent24h: responseData.messages?.recent24h || 0,
          growth: (responseData.messages as any)?.growth || 0,
          trend: ((responseData.messages as any)?.trend as "up" | "down" | "stable") || "stable",
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
        topPerformers: {
          users: [],
          pets: [],
        },
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

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.bg },
        ])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface },
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
        { backgroundColor: colors.bg },
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
        <View style={styles.header}>
          <TouchableOpacity
            testID="AdminAnalyticsScreen-button"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              (navigation as { goBack: () => void }).goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.onSurface }])}
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
                      selectedPeriod === period ? colors.primary : colors.surface,
                  },
                ])}
                testID="AdminAnalyticsScreen-button-2"
                accessibilityLabel="Interactive element"
                accessibilityRole="button"
                onPress={() => {
                  handlePeriodChange(period);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.periodText,
                    {
                      color:
                        selectedPeriod === period ? theme.colors.onPrimary : colors.onSurface,
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
            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ])}
              >
                Key Metrics
              </Text>
              <KeyMetricsSection
                analytics={{
                  users: {
                    total: analytics.users.total,
                    growth: analytics.users.growth,
                    trend: analytics.users.trend,
                  },
                  matches: {
                    total: analytics.matches.total,
                    growth: analytics.matches.growth,
                    trend: analytics.matches.trend,
                  },
                  messages: {
                    total: analytics.messages.total,
                    growth: analytics.messages.growth,
                    trend: analytics.messages.trend,
                  },
                  revenue: {
                    totalRevenue: analytics.revenue.totalRevenue,
                    monthlyRecurringRevenue: analytics.revenue.monthlyRecurringRevenue,
                  },
                }}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ])}
              >
                Engagement
              </Text>
              <EngagementMetricsSection engagement={analytics.engagement} />
            </View>

            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ])}
              >
                Revenue Analytics
              </Text>
              <RevenueMetricsSection
                revenue={{
                  averageRevenuePerUser: analytics.revenue.averageRevenuePerUser,
                  conversionRate: analytics.revenue.conversionRate,
                  churnRate: analytics.revenue.churnRate,
                }}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ])}
              >
                Security Overview
              </Text>
              <SecurityMetricsSection security={analytics.security} />
            </View>

            <View style={styles.section}>
              <Text
                style={StyleSheet.flatten([
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ])}
              >
                Top Performers
              </Text>
              <TopPerformersSection topPerformers={analytics.topPerformers} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
