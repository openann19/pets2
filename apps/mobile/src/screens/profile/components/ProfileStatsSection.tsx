import { logger } from '@pawfectmatch/core';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { AdvancedCard, CardConfigs } from '../../../components/Advanced/AdvancedCard';
import { matchesAPI } from '../../../services/api';
import { useTheme } from '@/theme';
import { useCountUpAnimation } from '@/hooks/animations';

interface ProfileStatsSectionProps {
  matchCount?: number;
  messageCount?: number;
  petCount?: number;
}

interface AnimatedStatProps {
  value: number;
  label: string;
  delay: number;
  theme: ReturnType<typeof useTheme>;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ value, label, delay, theme }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);
  const { count, getDisplayValue } = useCountUpAnimation(value, 800, true);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: count.value > 0 ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <Animated.Text style={[styles.statNumber, { color: theme.colors.primary }, numberStyle]}>
        {Math.round(count.value)}
      </Animated.Text>
      <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>{label}</Text>
    </Animated.View>
  );
};

export const ProfileStatsSection: React.FC<ProfileStatsSectionProps> = React.memo(
  ({ matchCount = 12, messageCount = 8, petCount = 3 }) => {
    const theme = useTheme();
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
          <AnimatedStat
            value={matchCount}
            label="Matches"
            delay={100}
            theme={theme}
          />
          <AnimatedStat
            value={messageCount}
            label="Messages"
            delay={200}
            theme={theme}
          />
          <AnimatedStat
            value={petCount}
            label="Pets"
            delay={300}
            theme={theme}
          />
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});

ProfileStatsSection.displayName = 'ProfileStatsSection';
