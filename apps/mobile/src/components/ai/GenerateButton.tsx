/**
 * Generate Button Component
 * Large CTA button for generating AI bio
 */

import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface GenerateButtonProps {
  isGenerating: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onPress,
  disabled = false,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[
        styles.generateButton,
        (isGenerating || disabled) && styles.generatingButton,
      ]}
      onPress={onPress}
      disabled={isGenerating || disabled}
      accessibilityLabel={isGenerating ? 'Generating bio' : 'Generate bio'}
      accessibilityRole="button"
      testID="generate-bio-button"
    >
      <LinearGradient
        colors={
          isGenerating || disabled
            ? [theme.colors.onMuted, theme.colors.onMuted]
            : [theme.colors.primary, theme.colors.primary]
        }
        style={styles.generateButtonGradient}
      >
        {isGenerating ? (
          <ActivityIndicator
            color={theme.colors.bg}
            size="small"
          />
        ) : (
          <Ionicons
            name="star"
            size={20}
            color={theme.colors.bg}
          />
        )}
        <Text style={styles.generateButtonText}>
          {isGenerating ? 'Generating...' : 'Generate Bio'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    generateButton: {
      marginVertical: theme.spacing.xl,
    },
    generatingButton: {
      opacity: 0.7,
    },
    generateButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.full,
      gap: theme.spacing.sm,
    },
    generateButtonText: {
      color: theme.colors.bg,
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
  });
};

