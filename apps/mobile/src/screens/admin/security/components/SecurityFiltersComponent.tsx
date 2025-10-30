/**
 * Security Filters Component
 * Displays filters for security alerts
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SecuritySeverityFilter, SecurityTypeFilter } from "../types";
import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 60,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonActive: {
    // Active state handled by backgroundColor
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
}


interface SecurityFiltersComponentProps {
  selectedSeverity: SecuritySeverityFilter;
  selectedType: SecurityTypeFilter;
  onSeverityChange: (severity: SecuritySeverityFilter) => void;
  onTypeChange: (type: SecurityTypeFilter) => void;
}

export const SecurityFiltersComponent: React.FC<SecurityFiltersComponentProps> = ({
  selectedSeverity,
  selectedType,
  onSeverityChange,
  onTypeChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.filtersContainer}>
      {/* Severity Filter */}
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Severity:</Text>
        <View style={styles.filterButtons}>
          {(["all", "critical", "high", "medium", "low"] as const).map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterButton,
                selectedSeverity === severity && styles.filterButtonActive,
                {
                  backgroundColor: selectedSeverity === severity ? colors.primary : colors.surface,
                },
              ]}
              testID={`severity-filter-${severity}`}
              accessibilityLabel={`Filter by ${severity} severity`}
              accessibilityRole="button"
              onPress={() => onSeverityChange(severity)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedSeverity === severity ? theme.colors.surface : colors.onSurface,
                  },
                ]}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Type Filter */}
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Type:</Text>
        <View style={styles.filterButtons}>
          {(
            [
              "all",
              "suspicious_login",
              "blocked_ip",
              "reported_content",
              "spam_detected",
              "data_breach",
              "unusual_activity",
            ] as const
          ).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive,
                {
                  backgroundColor: selectedType === type ? colors.primary : colors.surface,
                },
              ]}
              testID={`type-filter-${type}`}
              accessibilityLabel={`Filter by ${type} type`}
              accessibilityRole="button"
              onPress={() => onTypeChange(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: selectedType === type ? theme.colors.surface : colors.onSurface,
                  },
                ]}
              >
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
