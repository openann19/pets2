/**
 * Form Navigation Component
 * Back/Next buttons for multi-step form
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  nextLabel,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        footer: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        backStepButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
        backStepButtonText: {
          fontSize: 16,
          color: theme.colors.onMuted,
          fontWeight: '600' as const,
        },
        nextButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.sm,
          flex: 1,
          marginLeft: theme.spacing.md,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
        disabledButton: {
          backgroundColor: theme.colors.onMuted,
          opacity: 0.6,
        },
        nextButtonText: {
          fontSize: 16,
          color: theme.colors.onPrimary,
          fontWeight: '600' as const,
        },
      }),
    [theme],
  );

  const isLastStep = currentStep === totalSteps - 1;
  const buttonLabel = nextLabel || (isLastStep ? 'Submit Application' : 'Next');

  return (
    <View style={styles.footer}>
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.backStepButton}
          testID="AdoptionApplicationScreen-prev-step"
          accessibilityRole="button"
          accessibilityLabel="Go to previous step"
          onPress={onBack}
        >
          <Text style={styles.backStepButtonText}>Back</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.disabledButton]}
        testID="AdoptionApplicationScreen-next-step"
        accessibilityRole="button"
        accessibilityLabel={isLastStep ? 'Submit adoption application' : 'Go to next step'}
        accessibilityState={{ disabled: !canProceed }}
        onPress={onNext}
        disabled={!canProceed}
      >
        <Text style={styles.nextButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

