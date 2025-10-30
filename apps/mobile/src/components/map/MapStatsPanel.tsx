import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';

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

export function MapStatsPanel({ stats, opacity }: MapStatsPanelProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Animated.View style={[styles.statsContainer, { opacity }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
          {stats.activePets}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
          {stats.nearbyMatches}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Matches</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
          {stats.recentActivity}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Recent</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
});
