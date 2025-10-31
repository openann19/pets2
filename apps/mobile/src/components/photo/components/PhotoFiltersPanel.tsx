/**
 * Photo Filters Panel Component
 * Filter presets display and selection
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { BouncePressable } from '../../micro';
import { FILTER_PRESETS } from '../filterPresets';
import type { FilterPreset } from '../types';

interface PhotoFiltersPanelProps {
  onApplyFilter: (preset: FilterPreset) => void;
}

export const PhotoFiltersPanel: React.FC<PhotoFiltersPanelProps> = ({ onApplyFilter }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        contentContainer: {
          flex: 1,
          padding: theme.spacing.md,
        },
        filtersContainer: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          padding: theme.spacing.md,
        },
        filterCard: {
          width: '30%',
          aspectRatio: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          margin: '1.5%',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          padding: theme.spacing.sm,
        },
        filterIcon: {
          marginBottom: theme.spacing.xs,
          borderRadius: theme.radii.full,
          padding: theme.spacing.sm,
        },
        filterName: {
          fontSize: 12,
          color: theme.colors.onSurface,
          textAlign: 'center' as const,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.contentContainer}>
      <View style={styles.filtersContainer}>
        {FILTER_PRESETS.map((preset, index) => (
          <Animated.View
            key={preset.name}
            entering={FadeInDown.delay(50 * (index + 1)).springify()}
            exiting={FadeOutUp}
          >
            <BouncePressable
              style={styles.filterCard}
              onPress={() => onApplyFilter(preset)}
              accessibilityLabel={`Apply ${preset.name} filter`}
            >
              <BlurView intensity={20} style={styles.filterIcon}>
                <Ionicons name={preset.icon as any} size={28} color={theme.colors.onSurface} />
              </BlurView>
              <Text style={styles.filterName}>{preset.name}</Text>
            </BouncePressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

