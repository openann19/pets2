/**
 * Tips Card Component
 * Displays tips for successful pet interactions
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
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});
}


interface TipsCardProps {
  tips: string[];
}

export const TipsCard: React.FC<TipsCardProps> = ({ tips }) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="bulb-outline"
          size={24}
          color={theme.colors.warning}
        />
        <Text style={[styles.resultTitle, { color: colors.onSurface }]}>
          Tips for Success
        </Text>
      </View>
      <View style={styles.tipsList}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.warning}
            />
            <Text style={[styles.tipText, { color: colors.onSurface }]}>
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
