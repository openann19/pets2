/**
 * Detailed Analysis Card Component
 * Shows detailed text analysis and tips
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
  detailedText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
}


interface DetailedAnalysisCardProps {
  detailed: string;
}

export const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({
  detailed,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="document-text"
          size={24}
          color={colors.onMuted || colors.onMuted}
        />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]}>
          Detailed Analysis
        </Text>
      </View>
      <Text style={[styles.detailedText, { color: colors.onSurface }]}>
        {detailed}
      </Text>
    </View>
  );
};
