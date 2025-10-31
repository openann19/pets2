/**
 * Submit Button Component
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled,
  onSubmit,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isSubmitting || disabled) && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting || disabled}
        testID="submit-listing-button"
        accessibilityLabel="Create listing"
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting || disabled }}
      >
        <LinearGradient
          colors={
            isSubmitting || disabled
              ? [colors.onMuted, colors.onMuted]
              : palette?.gradients?.primary ?? [colors.primary, colors.primary]
          }
          style={styles.submitGradient}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                size="small"
                color={colors.onSurface}
              />
              <Text style={[styles.submitText, { color: colors.onSurface }]}>Creating Listing...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="paw"
                size={20}
                color={colors.onSurface}
              />
              <Text style={[styles.submitText, { color: colors.onSurface }]}>Create Listing</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      padding: theme.spacing.lg,
    },
    submitButton: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitGradient: {
      paddingVertical: theme.spacing.md + theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    submitText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
  });
}

