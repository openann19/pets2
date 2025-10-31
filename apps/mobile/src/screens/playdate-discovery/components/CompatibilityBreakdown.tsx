/**
 * Compatibility Breakdown Component
 * Shows detailed compatibility factors for a match
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';
import type { PlaydateMatch } from '../types';

interface CompatibilityBreakdownProps {
  match: PlaydateMatch;
}

export const CompatibilityBreakdown: React.FC<CompatibilityBreakdownProps> = ({ match }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        compatibilityBreakdown: {
          marginBottom: theme.spacing.md,
        },
        compatibilityRow: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.sm,
        },
        compatibilityLabel: {
          width: 80,
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        compatibilityBar: {
          flex: 1,
          height: 8,
          backgroundColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          marginHorizontal: theme.spacing.sm,
        },
        compatibilityFill: {
          height: '100%',
          borderRadius: theme.radii.sm,
        },
        compatibilityValue: {
          width: 40,
          fontSize: 14,
          fontWeight: '600' as const,
          textAlign: 'right' as const,
          color: theme.colors.onSurface,
        },
      }),
    [theme],
  );

  const factors = [
    { key: 'playStyle' as const, label: 'Play Style', color: theme.colors.primary },
    { key: 'energy' as const, label: 'Energy', color: theme.colors.success },
    { key: 'size' as const, label: 'Size', color: theme.colors.warning },
    { key: 'sociability' as const, label: 'Social', color: theme.colors.primary },
    { key: 'location' as const, label: 'Distance', color: theme.colors.info || theme.colors.primary },
  ];

  return (
    <View style={styles.compatibilityBreakdown}>
      {factors.map((factor) => (
        <View key={factor.key} style={styles.compatibilityRow}>
          <Text style={styles.compatibilityLabel}>{factor.label}</Text>
          <View style={styles.compatibilityBar}>
            <View
              style={[
                styles.compatibilityFill,
                {
                  width: `${match.compatibilityFactors[factor.key]}%`,
                  backgroundColor: factor.color,
                },
              ]}
            />
          </View>
          <Text style={styles.compatibilityValue}>{match.compatibilityFactors[factor.key]}%</Text>
        </View>
      ))}
    </View>
  );
};

