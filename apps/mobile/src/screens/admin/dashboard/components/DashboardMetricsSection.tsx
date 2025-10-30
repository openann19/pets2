/**
 * Dashboard Metrics Section Component
 * Displays overview metrics for admin dashboard
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { AdminStats } from "../types";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    metricsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metricCard: {
      width: "48%",
      borderRadius: 16,
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
      marginBottom: 12,
    },
    metricTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    metricValue: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 8,
    },
    metricDetails: {
      gap: 4,
    },
    metricDetail: {
      fontSize: 12,
    },
  });
}


interface DashboardMetricsSectionProps {
  stats: AdminStats;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({
  stats,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.metricsContainer}>
      {/* Users Stats */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Users</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(stats.users.total)}
        </Text>
        <View style={styles.metricDetails}>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            Active: {formatNumber(stats.users.active)}
          </Text>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]}>
            Verified: {formatNumber(stats.users.verified)}
          </Text>
        </View>
      </View>

      {/* Pets Stats */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons name="paw" size={24} color={colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Pets</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(stats.pets.total)}
        </Text>
        <View style={styles.metricDetails}>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            Active: {formatNumber(stats.pets.active)}
          </Text>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            New (24h): {stats.pets.recent24h}
          </Text>
        </View>
      </View>

      {/* Matches Stats */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons name="heart" size={24} color={colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Matches</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(stats.matches.total)}
        </Text>
        <View style={styles.metricDetails}>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            Active: {formatNumber(stats.matches.active)}
          </Text>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            Blocked: {stats.matches.blocked}
          </Text>
        </View>
      </View>

      {/* Messages Stats */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons name="chatbubble" size={24} color={colors.primary} />
          <Text style={[styles.metricTitle, { color: colors.onSurface }]>Messages</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]>
          {formatNumber(stats.messages.total)}
        </Text>
        <View style={styles.metricDetails}>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            New (24h): {stats.messages.recent24h}
          </Text>
          <Text style={[styles.metricDetail, { color: colors.onMuted }]>
            Deleted: {formatNumber(stats.messages.deleted)}
          </Text>
        </View>
      </View>
    </View>
  );
};
