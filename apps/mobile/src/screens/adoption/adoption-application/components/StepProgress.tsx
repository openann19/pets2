/**
 * Step Progress Indicator Component
 * Shows progress through multi-step form
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        progressContainer: {
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
        },
        progressBar: {
          height: 4,
          backgroundColor: theme.colors.onMuted,
          borderRadius: theme.radii.sm,
          overflow: 'hidden' as const,
          marginBottom: theme.spacing.sm,
        },
        progressFill: {
          height: '100%',
          backgroundColor: theme.colors.primary,
        },
        progressText: {
          fontSize: 14,
          color: theme.colors.onMuted,
          textAlign: 'center' as const,
        },
      }),
    [theme],
  );

  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.progressContainer}>
      <View
        style={styles.progressBar}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: totalSteps, now: currentStep + 1 }}
      >
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep + 1} of {totalSteps}</Text>
    </View>
  );
};

