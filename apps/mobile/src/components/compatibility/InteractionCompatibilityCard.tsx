/**
 * Interaction Compatibility Card Component
 * Shows compatibility for different interaction types
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
    interactionGrid: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    interactionItem: {
      flex: 1,
      alignItems: "center",
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    interactionLabel: {
      fontSize: theme.typography.body.size,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onMuted,
    },
    interactionScore: {
      fontSize: theme.typography.h2.size,
      fontWeight: "bold",
    },
  });
}


interface InteractionData {
  playdate: number;
  adoption: number;
  breeding: number;
}

interface InteractionCompatibilityCardProps {
  interactions: InteractionData;
}

export const InteractionCompatibilityCard: React.FC<InteractionCompatibilityCardProps> = ({
  interactions,
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
        <Ionicons name="people" size={24} color={colors.primary} />
        <Text style={styles.resultTitle}>
          Interaction Compatibility
        </Text>
      </View>
      <View style={styles.interactionGrid}>
        {Object.entries(interactions).map(([type, score]) => (
          <View key={type} style={styles.interactionItem}>
            <Text style={styles.interactionLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Text
              style={[styles.interactionScore, { color: getScoreColor(score) }]}
            >
              {score}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
