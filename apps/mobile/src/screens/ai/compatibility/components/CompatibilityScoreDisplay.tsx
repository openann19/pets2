/**
 * Compatibility Score Display Component
 * Displays the overall compatibility score
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";
// import type { Theme } from "@/theme"; // Removed deprecated import

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.shadow, // Replaced "#000"
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
  overallScore: {
    alignItems: "center",
    gap: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  scoreDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
}


interface CompatibilityScore {
  overall: number;
}

interface CompatibilityScoreDisplayProps {
  score: CompatibilityScore;
  summary: string;
}

const getScoreColor = (score: number, colors: any) => {
  if (score >= 90) return colors.success;
  if (score >= 80) return colors.primary;
  if (score >= 70) return colors.warning;
  return colors.danger;
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  return "Poor";
};

export const CompatibilityScoreDisplay: React.FC<CompatibilityScoreDisplayProps> = ({
  score,
  summary,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="trophy"
          size={24}
          color={getScoreColor(score.overall, colors)}
        />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]}>
          Overall Compatibility
        </Text>
      </View>
      <View style={styles.overallScore}>
        <Text
          style={[styles.scoreValue, { color: getScoreColor(score.overall, colors) }]} // Fixed JSX syntax
        >
          {score.overall}%
        </Text>
        <Text style={[styles.scoreLabel, { color: colors.onMuted }]}> // Fixed JSX syntax
          {getScoreLabel(score.overall)}
        </Text>
        <Text style={[styles.scoreDescription, { color: colors.onSurface }]}> // Fixed JSX syntax
          {summary}
        </Text>
      </View>
    </View>
  );
};
