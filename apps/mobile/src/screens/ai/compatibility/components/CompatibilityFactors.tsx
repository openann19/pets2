/**
 * Compatibility Factors Component
 * Displays strengths, concerns, and recommendations
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  factorsSection: {
    gap: 16,
  },
  factorGroup: {
    gap: 8,
  },
  factorGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  factorText: {
    fontSize: 14,
    flex: 1,
  },
});
}


interface Factors {
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

interface CompatibilityFactorsProps {
  factors: Factors;
}

export const CompatibilityFactors: React.FC<CompatibilityFactorsProps> = ({
  factors,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      <View style={styles.resultHeader}>
        <Ionicons name="list" size={24} color={colors.success} />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]}>
          Analysis Factors
        </Text>
      </View>

      <View style={styles.factorsSection}>
        <View style={styles.factorGroup}>
          <Text style={[styles.factorGroupTitle, { color: colors.success }]}>
            Strengths
          </Text>
          {factors.strengths.map((strength, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.factorText, { color: colors.onSurface }]}>
                {strength}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.factorGroup}>
          <Text style={[styles.factorGroupTitle, { color: colors.warning }]}>
            Concerns
          </Text>
          {factors.concerns.map((concern, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={[styles.factorText, { color: colors.onSurface }]}>
                {concern}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.factorGroup}>
          <Text style={[styles.factorGroupTitle, { color: colors.primary }]}>
            Recommendations
          </Text>
          {factors.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="bulb" size={16} color={colors.primary} />
              <Text style={[styles.factorText, { color: colors.onSurface }]}>
                {recommendation}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
