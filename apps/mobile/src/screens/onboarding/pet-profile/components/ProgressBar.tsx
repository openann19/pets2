/**
 * Progress Bar Component
 * Shows step progress for multi-step forms
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  progressValue: Animated.SharedValue<number>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  progressValue,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;
  const { width: screenWidth } = useWindowDimensions();

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value * screenWidth,
    };
  });

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
        <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: colors.primary }]} />
      </View>
      <Text style={[styles.progressText, { color: colors.onMuted }]}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    progressContainer: {
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 4,
      borderRadius: theme.radii.xs,
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.radii.xs,
      maxWidth: '100%',
    },
    progressText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.medium,
    },
  });
}

