/**
 * Key Metrics Section Component
 * Displays main analytics metrics (users, matches, messages, revenue)
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.onSurface,
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
});
}


interface MetricData {
  total: number;
  growth: number;
  trend: "up" | "down" | "stable";
}

interface AnalyticsData {
  users: MetricData;
  matches: MetricData;
  messages: MetricData;
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  };
}

interface KeyMetricsSectionProps {
  analytics: AnalyticsData;
}

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

const getTrendColor = (trend: "up" | "down" | "stable", theme: any): string => {
  switch (trend) {
    case "up":
      return theme.colors.success;
    case "down":
      return theme.colors.danger;
    default:
      return theme.colors.onMuted;
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

export const KeyMetricsSection: React.FC<KeyMetricsSectionProps> = ({ analytics }) => {
    const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.metricsGrid}>
      {/* Users Metric */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]>
        <View style={styles.metricHeader}>
          <Ionicons name="people" size={20} color={theme.colors.info} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Users</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(analytics.users.total)}
        </Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.users.trend)}
            size={16}
            color={getTrendColor(analytics.users.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.users.trend, theme) },
            ]}
          >
            {analytics.users.growth > 0 ? "+" : ""}
            {analytics.users.growth}%
          </Text>
        </View>
      </View>

      {/* Matches Metric */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]>
        <View style={styles.metricHeader}>
          <Ionicons name="heart" size={20} color={theme.colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Matches</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(analytics.matches.total)}
        </Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.matches.trend)}
            size={16}
            color={getTrendColor(analytics.matches.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.matches.trend, theme) },
            ]}
          >
            {analytics.matches.growth > 0 ? "+" : ""}
            {analytics.matches.growth}%
          </Text>
        </View>
      </View>

      {/* Messages Metric */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]>
        <View style={styles.metricHeader}>
          <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Messages</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(analytics.messages.total)}
        </Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.messages.trend)}
            size={16}
            color={getTrendColor(analytics.messages.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.messages.trend, theme) },
            ]}
          >
            {analytics.messages.growth > 0 ? "+" : ""}
            {analytics.messages.growth}%
          </Text>
        </View>
      </View>

      {/* Revenue Metric */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]>
        <View style={styles.metricHeader}>
          <Ionicons name="cash" size={20} color={theme.colors.success} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Revenue</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatCurrency(analytics.revenue.totalRevenue)}
        </Text>
        <Text style={[styles.metricSubtext, { color: colors.onMuted }]>
          MRR: {formatCurrency(analytics.revenue.monthlyRecurringRevenue)}
        </Text>
      </View>
    </View>
  );
};
