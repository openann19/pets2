/**
 * Step Navigation Footer Component
 * Navigation buttons for multi-step forms
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  nextButtonText?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  nextButtonText,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={onBack}
        testID="step-navigation-back"
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Text style={[styles.backButtonText, { color: colors.onSurface }]}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: colors.primary },
          !canProceed && [styles.disabledButton, { backgroundColor: colors.surface, opacity: 0.6 }],
        ]}
        onPress={onNext}
        disabled={!canProceed}
        testID="step-navigation-next"
        accessibilityLabel={nextButtonText || 'Next'}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canProceed }}
      >
        <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>
          {nextButtonText || (currentStep === totalSteps - 1 ? 'Complete' : 'Next')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.lg + theme.spacing.xs,
      borderTopWidth: 1,
    },
    backButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      minWidth: 100,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    nextButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
      borderRadius: theme.radii.sm,
      minWidth: 100,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    nextButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
  });
}

