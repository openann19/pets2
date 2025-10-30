/**
 * Basic Info Step Component
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { PetFormData } from '../types';
import { SPECIES_OPTIONS } from '../types';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useReduceMotion } from '../../../../hooks/useReducedMotion';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    stepContainer: {
      flex: 1,
      padding: 20,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 14,
      marginBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    optionButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      minWidth: 100,
    },
    selectedOption: {
      borderWidth: 2,
    },
    optionText: {
      fontSize: 14,
      textAlign: 'center',
    },
    selectedOptionText: {
      fontWeight: '600',
    },
  });
}

interface BasicInfoStepProps {
  formData: PetFormData;
  updateFormData: (field: string, value: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData }) => {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View
      style={styles.stepContainer}
      testID="basic-info-step"
    >
      <Text
        style={[styles.stepTitle, { color: colors.onSurface }]}
        accessibilityRole="header"
        testID="basic-info-title"
      >
        Basic Information
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: colors.onMuted }]}
        testID="basic-info-subtitle"
      >
        Tell us about your pet
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Pet Name *</Text>
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="e.g., Buddy, Luna, Max"
          placeholderTextColor={colors.onMuted}
          testID="pet-name-input"
          accessibilityLabel="Pet name"
          accessibilityRole="text"
          accessibilityHint="Enter your pet's name"
          autoCapitalize="words"
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
                formData.species === option.value && styles.selectedOption,
                {
                  backgroundColor:
                    formData.species === option.value ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => updateFormData('species', option.value)}
              accessibilityLabel={`Select ${option.label}`}
              accessibilityRole="button"
              testID={`species-${option.value}`}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.species === option.value && styles.selectedOptionText,
                  { color: formData.species === option.value ? colors.onSurface : colors.onMuted },
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
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          value={formData.breed}
          onChangeText={(text) => updateFormData('breed', text)}
          placeholder="e.g., Golden Retriever, Persian Cat"
          placeholderTextColor={colors.onMuted}
          testID="pet-breed-input"
          accessibilityLabel="Pet breed"
          accessibilityRole="text"
          accessibilityHint="Enter your pet's breed"
          autoCapitalize="words"
        />
      </View>
    </View>
  );
};
