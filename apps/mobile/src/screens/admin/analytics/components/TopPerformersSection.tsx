/**
 * Top Performers Section Component
 * Displays top performing users and pets
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    performersGrid: {
      flexDirection: "row",
      gap: 12,
    },
    performersCard: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    performersTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    performerItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    performerRank: {
      fontSize: 12,
      fontWeight: "600",
      width: 20,
    },
    performerName: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
    performerStats: {
      fontSize: 12,
    },
  });
}


interface Performer {
  id: string;
  name: string;
  matches?: number;
  likes?: number;
  breed?: string;
}

interface TopPerformersData {
  users: Performer[];
  pets: Performer[];
}

interface TopPerformersSectionProps {
  topPerformers: TopPerformersData;
}

export const TopPerformersSection: React.FC<TopPerformersSectionProps> = ({
  topPerformers,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.performersGrid}>
      {/* Top Users */}
      <View style={[styles.performersCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.performersTitle, { color: colors.onSurface }]}>
          Top Users
        </Text>
        {topPerformers.users.slice(0, 3).map((user, index) => (
          <View key={user.id} style={styles.performerItem}>
            <Text style={[styles.performerRank, { color: colors.onMuted }]}>
              #{index + 1}
            </Text>
            <Text style={[styles.performerName, { color: colors.onSurface }]}>
              {user.name}
            </Text>
            <Text style={[styles.performerStats, { color: colors.onMuted }]}>
              {user.matches} matches
            </Text>
          </View>
        ))}
      </View>

      {/* Top Pets */}
      <View style={[styles.performersCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.performersTitle, { color: colors.onSurface }]}>
          Top Pets
        </Text>
        {topPerformers.pets.slice(0, 3).map((pet, index) => (
          <View key={pet.id} style={styles.performerItem}>
            <Text style={[styles.performerRank, { color: colors.onMuted }]}>
              #{index + 1}
            </Text>
            <Text style={[styles.performerName, { color: colors.onSurface }]}>
              {pet.name}
            </Text>
            <Text style={[styles.performerStats, { color: colors.onMuted }]}>
              {pet.matches} matches
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
