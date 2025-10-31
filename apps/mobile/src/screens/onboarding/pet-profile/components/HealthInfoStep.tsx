/**
 * Health Info Step Component
 * Fourth step: health information toggles
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { PetFormData } from '../types';

interface HealthInfoStepProps {
  formData: PetFormData;
  onToggleHealth: (field: string, value: boolean) => void;
}

export const HealthInfoStep: React.FC<HealthInfoStepProps> = ({
  formData,
  onToggleHealth,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  const healthOptions = [
    { key: 'vaccinated', label: 'Vaccinated', icon: '💉' },
    { key: 'spayedNeutered', label: 'Spayed/Neutered', icon: '🏥' },
    { key: 'microchipped', label: 'Microchipped', icon: '🔍' },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>Health Information</Text>
      <Text style={[styles.stepSubtitle, { color: colors.onMuted }]}>
        Help potential matches know your pet's health status
      </Text>

      <View style={styles.healthOptions}>
        {healthOptions.map((option) => {
          const isSelected = formData.healthInfo[option.key as keyof typeof formData.healthInfo];
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.healthOption,
                { borderColor: colors.border, backgroundColor: colors.surface },
                isSelected && [styles.selectedHealthOption, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onToggleHealth(option.key, !isSelected)}
              testID={`health-option-${option.key}`}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              <Text style={styles.healthIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.healthLabel,
                  { color: colors.onMuted },
                  isSelected && [styles.selectedHealthLabel, { color: colors.primary }],
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.healthNote, { color: colors.onMuted }]}>
        💡 Providing health information helps build trust with potential adopters and ensures better matches.
      </Text>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: theme.typography.h2.size * 1.2,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    stepSubtitle: {
      fontSize: theme.typography.body.size,
      marginBottom: theme.spacing.lg + theme.spacing.xs,
    },
    healthOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    healthOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
    },
    selectedHealthOption: {
      borderWidth: 1,
    },
    healthIcon: {
      fontSize: theme.typography.body.size,
      marginEnd: theme.spacing.xs,
    },
    healthLabel: {
      fontSize: theme.typography.body.size * 0.875,
    },
    selectedHealthLabel: {
      fontWeight: theme.typography.h2.weight,
    },
    healthNote: {
      fontSize: theme.typography.body.size * 0.875,
      lineHeight: theme.typography.body.lineHeight * 1.25,
      marginTop: theme.spacing.md,
    },
  });
}

