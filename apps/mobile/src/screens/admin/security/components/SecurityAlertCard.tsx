/**
 * Security Alert Card Component
 * Displays individual security alert information
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SecurityAlert } from "../types";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alertHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontWeight: "bold",
  },
  alertType: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  resolveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  blockButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertTimestamp: {
    fontSize: 12,
  },
  alertIP: {
    fontSize: 12,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
}


interface SecurityAlertCardProps {
  alert: SecurityAlert;
  onPress: (alert: SecurityAlert) => void;
  onResolve: (alertId: string) => void;
  onBlockIP?: (alertId: string, ipAddress: string) => void;
  isActionLoading: boolean;
}

const getSeverityColor = (severity: SecurityAlert['severity'], colors: AppTheme['colors']) => {
  switch (severity) {
    case 'critical':
      return colors.danger;
    case 'high':
      return colors.warning;
    case 'medium':
      return colors.info;
    case 'low':
      return colors.success;
    default:
      return colors.onMuted;
  }
};

const getTypeIcon = (type: SecurityAlert["type"]) => {
  switch (type) {
    case "suspicious_login":
      return "key";
    case "blocked_ip":
      return "ban";
    case "reported_content":
      return "flag";
    case "spam_detected":
      return "mail";
    case "data_breach":
      return "lock-closed";
    case "unusual_activity":
      return "alert-circle";
    default:
      return "warning";
  }
};

export const SecurityAlertCard: React.FC<SecurityAlertCardProps> = ({
  alert,
  onPress,
  onResolve,
  onBlockIP,
  isActionLoading,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;
  const severityColor = getSeverityColor(alert.severity, colors);

  return (
    <TouchableOpacity
      style={[styles.alertCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(alert)}
      disabled={isActionLoading}
    >
      {/* Header */}
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
            <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
          </View>
          <Ionicons name={getTypeIcon(alert.type) as any} size={20} color={colors.onSurface} />
          <Text style={[styles.alertType, { color: colors.onMuted }]}>
            {alert.type.replace("_", " ")}
          </Text>
        </View>
        {!alert.resolved && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: colors.success }]}
              onPress={(e) => {
                e.stopPropagation();
                onResolve(alert.id);
              }}
              disabled={isActionLoading}
              testID="resolve-alert-button"
              accessibilityLabel="Resolve alert"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
            </TouchableOpacity>
            {alert.ipAddress && onBlockIP && (
              <TouchableOpacity
                style={[styles.blockButton, { backgroundColor: colors.danger }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onBlockIP(alert.id, alert.ipAddress!);
                }}
                disabled={isActionLoading}
                testID="block-ip-button"
                accessibilityLabel="Block IP address"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={16} color={theme.colors.surface} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: colors.onSurface }]}>{alert.title}</Text>
        <Text style={[styles.alertDescription, { color: colors.onMuted }]}>
          {alert.description}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.alertFooter}>
        <Ionicons name="time" size={14} color={colors.onMuted} />
        <Text style={[styles.alertTimestamp, { color: colors.onMuted }]}>
          {new Date(alert.timestamp).toLocaleString()}
        </Text>
        {alert.ipAddress && (
          <>
            <Ionicons name="location" size={14} color={colors.onMuted} />
            <Text style={[styles.alertIP, { color: colors.onMuted }]}>
              {alert.ipAddress}
            </Text>
          </>
        )}
      </View>

      {alert.resolved && (
        <View style={styles.resolvedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.resolvedText, { color: colors.success }]}>
            Resolved
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
