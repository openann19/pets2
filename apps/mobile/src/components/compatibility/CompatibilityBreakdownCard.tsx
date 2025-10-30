/**
 * Compatibility Breakdown Card Component
 * Shows detailed breakdown of compatibility factors
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function createStyles(theme: AppTheme) {
  const { spacing, radii, colors, typography } = theme;

  return StyleSheet.create({
    resultCard: {
      borderRadius: radii.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      ...theme.shadows.elevation2,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    resultTitle: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.onSurface,
    },
    breakdownList: {
      gap: spacing.sm,
    },
    breakdownItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    breakdownLabel: {
      fontSize: typography.body.size,
      width: 80,
      color: colors.onMuted,
    },
    breakdownBar: {
      flex: 1,
      height: spacing.xs,
      backgroundColor: colors.border,
      borderRadius: radii.xs,
      overflow: "hidden",
    },
    breakdownFill: {
      height: "100%",
      borderRadius: radii.xs,
    },
    breakdownScore: {
      fontSize: typography.body.size,
      fontWeight: "600",
      width: 48,
      textAlign: "right",
      color: colors.onSurface,
    },
  });
}


interface BreakdownData {
  temperament: number;
  activity: number;
  size: number;
  age: number;
  interests: number;
  lifestyle: number;
}

interface CompatibilityBreakdownCardProps {
  breakdown: BreakdownData;
}

export const CompatibilityBreakdownCard: React.FC<CompatibilityBreakdownCardProps> = ({
  breakdown,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success;
    if (score >= 80) return colors.info;
    if (score >= 70) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons name="bar-chart" size={24} color={colors.info} />
        <Text style={styles.resultTitle}>Compatibility Breakdown</Text>
      </View>
      <View style={styles.breakdownList}>
        {Object.entries(breakdown).map(([factor, score]) => (
          <View key={factor} style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>
              {factor.charAt(0).toUpperCase() + factor.slice(1)}
            </Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>{score}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
