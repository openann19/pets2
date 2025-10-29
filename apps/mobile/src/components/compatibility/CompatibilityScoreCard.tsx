/**
 * Compatibility Score Card Component
 * Displays overall compatibility score with breakdown
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../theme";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

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


interface CompatibilityScoreCardProps {
  overallScore: number;
  label: string;
  summary: string;
}

export const CompatibilityScoreCard: React.FC<CompatibilityScoreCardProps> = ({
  overallScore,
  label,
  summary,
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

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  };

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]>
      <View style={styles.resultHeader}>
        <Ionicons
          name="trophy"
          size={24}
          color={getScoreColor(overallScore)}
        />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]>
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
        <Text style={[styles.scoreLabel, { color: colors.onMuted }]>
          {getScoreLabel(overallScore)}
        </Text>
        <Text style={[styles.scoreDescription, { color: colors.onSurface }]>
          {summary}
        </Text>
      </View>
    </View>
  );
};
