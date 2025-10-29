/**
 * Compatibility Breakdown Card Component
 * Shows detailed breakdown of compatibility factors
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
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    width: 80,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
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
        <Ionicons name="bar-chart" size={24} color={theme.colors.info} />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]>
          Compatibility Breakdown
        </Text>
      </View>
      <View style={styles.breakdownList}>
        {Object.entries(breakdown).map(([factor, score]) => (
          <View key={factor} style={styles.breakdownItem}>
            <Text
              style={[styles.breakdownLabel, { color: colors.onMuted }]
            >
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
            <Text style={[styles.breakdownScore, { color: colors.onSurface }]>
              {score}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
