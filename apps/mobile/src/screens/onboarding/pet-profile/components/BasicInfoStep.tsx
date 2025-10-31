/**
 * Basic Info Step Component
 * First step: name, species, breed
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { PetFormData, Option } from '../types';
import { SPECIES_OPTIONS } from '../types';

interface BasicInfoStepProps {
  formData: PetFormData;
  onUpdate: (field: string, value: string) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, onUpdate }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>Basic Information</Text>
      <Text style={[styles.stepSubtitle, { color: colors.onMuted }]}>Tell us about your pet</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Pet Name *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
          value={formData.name}
          onChangeText={(text) => onUpdate('name', text)}
          placeholder="e.g., Buddy, Luna, Max"
          placeholderTextColor={colors.onMuted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Species *</Text>
        <View style={styles.optionsGrid}>
          {SPECIES_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                formData.species === option.value && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onUpdate('species', option.value)}
              testID={`species-option-${option.value}`}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.onMuted },
                  formData.species === option.value && [styles.selectedOptionText, { color: colors.primary }],
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Breed *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
          value={formData.breed}
          onChangeText={(text) => onUpdate('breed', text)}
          placeholder="e.g., Golden Retriever, Persian Cat"
          placeholderTextColor={colors.onMuted}
        />
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

