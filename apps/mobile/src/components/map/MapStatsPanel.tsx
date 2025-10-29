import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export interface MapStats {
  totalPets: number;
  activePets: number;
  nearbyMatches: number;
  recentActivity: number;
}

interface MapStatsPanelProps {
  stats: MapStats;
  opacity: Animated.Value;
}

export function MapStatsPanel({
  stats,
  opacity,
}: MapStatsPanelProps): React.JSX.Element {
  return (
    <Animated.View style={[styles.statsContainer, { opacity }]>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.activePets}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.nearbyMatches}</Text>
        <Text style={styles.statLabel}>Matches</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.recentActivity}</Text>
        <Text style={styles.statLabel}>Recent</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[0]",
  },
  statLabel: {
    fontSize: 12,
    color: "Theme.colors.neutral[300]",
  },
});
