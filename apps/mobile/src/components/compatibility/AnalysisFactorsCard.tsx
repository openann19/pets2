/**
 * Analysis Factors Card Component
 * Displays strengths, concerns, and recommendations
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
    factorsSection: {
      gap: theme.spacing.md,
    },
    factorGroup: {
      gap: theme.spacing.xs,
    },
    factorGroupTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: "600",
      marginBottom: theme.spacing.xs,
    },
    factorItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.xs,
    },
    factorText: {
      fontSize: theme.typography.body.size,
      flex: 1,
      color: theme.colors.onSurface,
    },
  });
}


interface AnalysisFactors {
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

interface AnalysisFactorsCardProps {
  factors: AnalysisFactors;
}

export const AnalysisFactorsCard: React.FC<AnalysisFactorsCardProps> = ({
  factors,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons name="list" size={24} color={colors.success} />
        <Text style={styles.resultTitle}>
          Analysis Factors
        </Text>
      </View>

      <View style={styles.factorsSection}>
        <View style={styles.factorGroup}>
          <Text
            style={[styles.factorGroupTitle, { color: colors.success }]}
          >
            Strengths
          </Text>
          {factors.strengths.map((strength, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.factorText}>
                {strength}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.factorGroup}>
          <Text
            style={[styles.factorGroupTitle, { color: colors.warning }]}
          >
            Concerns
          </Text>
          {factors.concerns.map((concern, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.factorText}>
                {concern}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.factorGroup}>
          <Text
            style={[styles.factorGroupTitle, { color: colors.info }]}
          >
            Recommendations
          </Text>
          {factors.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons
                name="bulb"
                size={16}
                color={colors.info}
              />
              <Text style={styles.factorText}>
                {recommendation}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
