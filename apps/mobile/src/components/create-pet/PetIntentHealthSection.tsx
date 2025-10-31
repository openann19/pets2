import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { PetFormData } from '../../hooks/usePetForm';
import type { FormFieldValue } from '../../types/forms';
import { useTheme } from '@/theme';

interface PetIntentHealthSectionProps {
  formData: PetFormData;
  errors: Record<string, string>;
  onUpdateFormData: (field: string, value: FormFieldValue) => void;
}

const intentOptions = [
  { value: 'adoption', label: 'Available for Adoption', emoji: '🏠' },
  { value: 'mating', label: 'Looking for Mates', emoji: '💕' },
  { value: 'playdate', label: 'Playdates Only', emoji: '🎾' },
  { value: 'all', label: 'Open to All', emoji: '🌟' },
];

const healthOptions = [
  { key: 'vaccinated', label: 'Vaccinated' },
  { key: 'spayedNeutered', label: 'Spayed/Neutered' },
  { key: 'microchipped', label: 'Microchipped' },
  { key: 'specialNeeds', label: 'Has Special Needs' },
];

const makeStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onMuted,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.danger,
      marginTop: 4,
    },
    intentOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    intentButton: {
      flex: 1,
      minWidth: 140,
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.bg,
    },
    intentButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
    },
    intentEmoji: {
      fontSize: 24,
      marginBottom: 8,
    },
    intentText: {
      fontSize: 16,
      color: theme.colors.onMuted,
      fontWeight: '500',
      flex: 1,
    },
    intentTextSelected: {
      color: theme.colors.primary,
    },
    healthOptions: {
      gap: 12,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 4,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxLabel: {
      fontSize: 16,
      color: theme.colors.onMuted,
    },
  });

export const PetIntentHealthSection: React.FC<PetIntentHealthSectionProps> = ({
  formData,
  errors,
  onUpdateFormData,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Intent & Health</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>What are you looking for? *</Text>
        <View style={styles.intentOptions}>
          {intentOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.intentButton,
                formData['intent'] === option.value && styles.intentButtonSelected,
              ])}
              onPress={() => {
                onUpdateFormData('intent', option.value);
              }}
            >
              <Text style={styles.intentEmoji}>{option.emoji}</Text>
              <Text
                style={StyleSheet.flatten([
                  styles.intentText,
                  formData['intent'] === option.value && styles.intentTextSelected,
                ])}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors['intent'] && <Text style={styles.errorText}>{errors['intent']}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Health Information</Text>
        <View style={styles.healthOptions}>
          {healthOptions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.checkboxContainer}
              onPress={() => {
                onUpdateFormData(
                  `healthInfo.${item.key}`,
                  !formData.healthInfo[item.key as keyof typeof formData.healthInfo],
                );
              }}
            >
              <View
                style={StyleSheet.flatten([
                  styles.checkbox,
                  formData.healthInfo[item.key as keyof typeof formData.healthInfo] &&
                    styles.checkboxChecked,
                ])}
              >
                {formData.healthInfo[item.key as keyof typeof formData.healthInfo] && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#ffffff"
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
