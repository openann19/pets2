/**
 * Interaction Compatibility Card Component
 * Shows compatibility for different interaction types
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../theme";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  interactionGrid: {
    flexDirection: "row",
    gap: 16,
  },
  interactionItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  interactionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  interactionScore: {
    fontSize: 18,
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
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.info;
    if (score >= 70) return theme.colors.warning;
    return theme.colors.danger;
  };

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]>
      <View style={styles.resultHeader}>
        <Ionicons name="people" size={24} color={theme.colors.primary} />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]>
          Interaction Compatibility
        </Text>
      </View>
      <View style={styles.interactionGrid}>
        {Object.entries(interactions).map(([type, score]) => (
          <View key={type} style={styles.interactionItem}>
            <Text
              style={[styles.interactionLabel, { color: colors.onMuted }]
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <Text
              style={[styles.interactionScore, { color: getScoreColor(score) }]
            >
              {score}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
