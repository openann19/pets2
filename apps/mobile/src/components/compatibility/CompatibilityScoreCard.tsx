/**
 * Compatibility Score Card Component
 * Displays overall compatibility score with breakdown
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    resultCard: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation2,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    resultTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    overallScore: {
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    scoreValue: {
      fontSize: theme.typography.h1.size,
      fontWeight: "bold",
    },
    scoreLabel: {
      fontSize: theme.typography.body.size,
      fontWeight: "600",
      color: theme.colors.onMuted,
    },
    scoreDescription: {
      fontSize: theme.typography.body.size,
      textAlign: "center",
      lineHeight: theme.typography.body.lineHeight,
      color: theme.colors.onSurface,
    },
  });
}


interface CompatibilityScoreCardProps {
  overallScore: number;
  label: string;
  summary: string;
}

export const CompatibilityScoreCard: React.FC<CompatibilityScoreCardProps> = ({
  overallScore,
  label: _label,
  summary,
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

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="trophy"
          size={24}
          color={getScoreColor(overallScore)}
        />
        <Text style={styles.resultTitle}>
          Overall Compatibility
        </Text>
      </View>
      <View style={styles.overallScore}>
        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(overallScore) },
          ]}
        >
          {overallScore}%
        </Text>
        <Text style={styles.scoreLabel}>
          {getScoreLabel(overallScore)}
        </Text>
        <Text style={styles.scoreDescription}>
          {summary}
        </Text>
      </View>
    </View>
  );
};
