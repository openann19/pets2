import { logger } from '@pawfectmatch/core';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AdvancedCard, CardConfigs } from '../../../components/Advanced/AdvancedCard';
import { matchesAPI } from '../../../services/api';

interface ProfileStatsSectionProps {
  matchCount?: number;
  messageCount?: number;
  petCount?: number;
}

export const ProfileStatsSection: React.FC<ProfileStatsSectionProps> = React.memo(
  ({ matchCount = 12, messageCount = 8, petCount = 3 }) => {
    const handleCardPress = useCallback(async () => {
      const [matches] = await Promise.all([
        matchesAPI.getMatches().catch(() => []),
        matchesAPI.getUserProfile().catch(() => null),
      ]);
      logger.info('Loaded stats:', { matches: matches.length });
    }, []);

    return (
      <AdvancedCard
        {...CardConfigs.glass({
          interactions: ['hover', 'press', 'glow'],
          haptic: 'light',
          apiAction: handleCardPress,
        })}
        style={styles.statsSection}
      >
        <View style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{matchCount}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{messageCount}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{petCount}</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
        </View>
      </AdvancedCard>
    );
  },
);

const styles = StyleSheet.create({
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginBottom: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.palette.neutral[500],
  },
});

ProfileStatsSection.displayName = 'ProfileStatsSection';
