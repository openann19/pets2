/**
 * Physical Info Step Component
 * Second step: age, gender, size
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { PetFormData } from '../types';
import { SIZE_OPTIONS } from '../types';

interface PhysicalInfoStepProps {
  formData: PetFormData;
  onUpdate: (field: string, value: string) => void;
}

export const PhysicalInfoStep: React.FC<PhysicalInfoStepProps> = ({ formData, onUpdate }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>Physical Details</Text>
      <Text style={[styles.stepSubtitle, { color: colors.onMuted }]}>Help others find the perfect match</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Age (years) *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
          value={formData.age}
          onChangeText={(text) => onUpdate('age', text)}
          placeholder="e.g., 2"
          keyboardType="numeric"
          placeholderTextColor={colors.onMuted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Gender *</Text>
        <View style={styles.optionsRow}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                formData.gender === gender && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onUpdate('gender', gender)}
              testID={`gender-option-${gender}`}
              accessibilityLabel={gender}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.onMuted },
                  formData.gender === gender && [styles.selectedOptionText, { color: colors.primary }],
                ]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Size *</Text>
        <View style={styles.optionsGrid}>
          {SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                formData.size === option.value && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onUpdate('size', option.value)}
              testID={`size-option-${option.value}`}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.onMuted },
                  formData.size === option.value && [styles.selectedOptionText, { color: colors.primary }],
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: theme.radii.sm,
      padding: theme.spacing.lg,
      fontSize: theme.typography.body.size,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    optionButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedOption: {
      borderWidth: 1,
    },
    optionText: {
      fontSize: theme.typography.body.size * 0.875,
    },
    selectedOptionText: {
      fontWeight: theme.typography.h2.weight,
    },
  });
}

