/**
 * Physical Info Step Component
 */

import { useTheme } from '@mobile/src/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { PetFormData } from '../types';
import { SIZE_OPTIONS } from '../types';

interface PhysicalInfoStepProps {
  formData: PetFormData;
  updateFormData: (field: string, value: any) => void;
}

export const PhysicalInfoStep: React.FC<PhysicalInfoStepProps> = ({ formData, updateFormData }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Details</Text>
      <Text style={styles.stepSubtitle}>Help others find the perfect match</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age (years) *</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="e.g., 2"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionsRow}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.optionButton, formData.gender === gender && styles.selectedOption]}
              testID="PhysicalInfoStep-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => updateFormData('gender', gender)}
            >
              <Text
                style={[styles.optionText, formData.gender === gender && styles.selectedOptionText]}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size *</Text>
        <View style={styles.optionsGrid}>
          {SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, formData.size === option.value && styles.selectedOption]}
              testID="PhysicalInfoStep-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => updateFormData('size', option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.size === option.value && styles.selectedOptionText,
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

const getStyles = (theme: any) =>
  StyleSheet.create({
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginBottom: 32,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    optionButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: '#fdf2f8',
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: '500',
    },
    selectedOptionText: {
      color: '#ec4899',
      fontWeight: '600',
    },
  });
