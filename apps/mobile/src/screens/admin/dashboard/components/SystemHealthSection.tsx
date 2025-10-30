/**
 * System Health Section Component
 * Displays system health status
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SystemHealth } from "../types";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    healthCard: {
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    healthHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    healthTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 8,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "bold",
    },
    healthMetrics: {
      gap: 12,
    },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metricLabel: {
      fontSize: 14,
      minWidth: 80,
    },
    metricValue: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
  });
}


interface SystemHealthSectionProps {
  health: SystemHealth;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

const formatMemory = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
};

const getStatusColor = (status: string, colors: AppTheme['colors']): string => {
  switch (status.toLowerCase()) {
    case "healthy":
    case "ok":
    case "connected":
      return colors.success;
    case "warning":
      return colors.warning;
    case "error":
    case "disconnected":
      return colors.danger;
    default:
      return colors.onMuted;
  }
};

export const SystemHealthSection: React.FC<SystemHealthSectionProps> = ({ health }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.healthCard, { backgroundColor: colors.surface }]>
      <View style={styles.healthHeader}>
        <Ionicons name="pulse" size={24} color={getStatusColor(health.status, colors)} />
        <Text style={[styles.healthTitle, { color: colors.onSurface }]>System Health</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(health.status, colors) }]>
          <Text style={styles.statusText}>{health.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.healthMetrics}>
        {/* Uptime */}
        <View style={styles.metricRow}>
          <Ionicons name="time" size={16} color={colors.onMuted} />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]>Uptime:</Text>
          <Text style={[styles.metricValue, { color: colors.onSurface }]>
            {formatUptime(health.uptime)}
          </Text>
        </View>

        {/* Database */}
        <View style={styles.metricRow}>
          <Ionicons
            name={health.database.connected ? "checkmark-circle" : "close-circle"}
            size={16}
            color={getStatusColor(health.database.status, colors)}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]>Database:</Text>
          <Text style={[styles.metricValue, { color: getStatusColor(health.database.status, colors) }]>
            {health.database.status}
          </Text>
        </View>

        {/* Memory */}
        <View style={styles.metricRow}>
          <Ionicons name="hardware-chip" size={16} color={colors.onMuted} />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]>Memory:</Text>
          <Text style={[styles.metricValue, { color: colors.onSurface }]>
            {formatMemory(health.memory.used)} / {formatMemory(health.memory.total)}
          </Text>
        </View>

        {/* Environment */}
        <View style={styles.metricRow}>
          <Ionicons name="settings" size={16} color={colors.onMuted} />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]>Environment:</Text>
          <Text style={[styles.metricValue, { color: colors.onSurface }]>{health.environment}</Text>
        </View>
      </View>
    </View>
  );
};
