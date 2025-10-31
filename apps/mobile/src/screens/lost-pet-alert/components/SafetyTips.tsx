/**
 * Safety Tips Component
 * Displays safety tips for lost pets
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

const SAFETY_TIPS = [
  'Never chase a lost pet - they may run further away',
  'Check your microchip registration is current',
  'Have recent photos ready for sharing',
  'Notify local shelters and vets immediately',
  'Post on community boards and social media',
  'Consider professional pet search services',
];

export const SafetyTips: React.FC = () => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        safetyTips: {
          margin: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.surface,
        },
        tipsTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        tipItem: {
          flexDirection: 'row' as const,
          marginBottom: theme.spacing.sm,
          paddingLeft: theme.spacing.sm,
        },
        tipBullet: {
          fontSize: 16,
          marginRight: theme.spacing.sm,
          color: theme.colors.primary,
        },
        tipText: {
          fontSize: 14,
          flex: 1,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.safetyTips}>
      <Text style={styles.tipsTitle}>🛡️ Safety Tips for Lost Pets</Text>
      {SAFETY_TIPS.map((tip, index) => (
        <View key={index} style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
};

