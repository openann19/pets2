import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EliteButtonPresets, Body, Heading2 } from '@mobile/components';
import { ShimmerPlaceholder } from '@mobile/components/ShimmerPlaceholder';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

type MapEmptyStateProps = {
  onAdjustFilters: () => void;
};

type MapErrorStateProps = {
  error: string;
  onRetry: () => void;
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing['4xl'],
      gap: theme.spacing.xl,
      backgroundColor: theme.colors.bg,
    },
    skeletonWrapper: {
      width: '100%',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    mapSkeleton: {
      width: '100%',
      height: 320,
      borderRadius: theme.radii['3xl'],
      overflow: 'hidden',
    },
    statRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      width: '100%',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
      height: 64,
      borderRadius: theme.radii.xl,
    },
    textBlock: {
      width: '80%',
      height: 18,
      borderRadius: theme.radii.lg,
    },
    stateWrapper: {
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
  });

export const MapSkeletonState: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mapRadius = theme.radii['3xl'];

  return (
    <View style={styles.container}>
      <View style={styles.skeletonWrapper}>
        <ShimmerPlaceholder
          height={320}
          borderRadius={mapRadius}
          style={[styles.mapSkeleton, { borderRadius: mapRadius }]}
        />
        <View style={styles.statRow}>
          <ShimmerPlaceholder style={styles.statItem} />
          <ShimmerPlaceholder style={styles.statItem} />
        </View>
        <View style={styles.statRow}>
          <ShimmerPlaceholder style={styles.statItem} />
          <ShimmerPlaceholder style={styles.statItem} />
        </View>
      </View>
    </View>
  );
};

export const MapEmptyState: React.FC<MapEmptyStateProps> = ({ onAdjustFilters }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.stateWrapper}>
        <Heading2>Explore more regions</Heading2>
        <Body>
          No active pet pins match your filters. Try expanding the radius or enabling additional
          activity types to discover nearby companions.
        </Body>
        <EliteButtonPresets.glass
          title="Adjust filters"
          leftIcon="options-outline"
          onPress={onAdjustFilters}
        />
      </View>
    </View>
  );
};

export const MapErrorState: React.FC<MapErrorStateProps> = ({ error, onRetry }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.stateWrapper}>
        <Heading2 accessibilityRole="header">Map data unavailable</Heading2>
        <Body accessibilityRole="text">{error}</Body>
        <EliteButtonPresets.premium
          title="Retry"
          leftIcon="refresh"
          onPress={onRetry}
        />
      </View>
    </View>
  );
};
