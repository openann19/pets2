/**
 * Experience Step Component
 * First step of adoption application - pet experience and living situation
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { ApplicationData } from '../types';
import { EXPERIENCE_OPTIONS, LIVING_SPACE_OPTIONS, YARD_CHOICES } from '../types';

interface ExperienceStepProps {
  formData: ApplicationData;
  onUpdateForm: <K extends keyof ApplicationData>(field: K, value: ApplicationData[K]) => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({ formData, onUpdateForm }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        stepContainer: {
          flex: 1,
        },
        stepTitle: {
          fontSize: 24,
          fontWeight: 'bold' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.xl,
        },
        inputGroup: {
          marginBottom: theme.spacing.xl,
        },
        label: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        optionsContainer: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          marginHorizontal: -theme.spacing.sm,
        },
        optionButton: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          marginHorizontal: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        },
        selectedOption: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        optionText: {
          fontSize: 14,
          color: theme.colors.onMuted,
          fontWeight: '500' as const,
        },
        selectedOptionText: {
          color: theme.colors.onPrimary,
          fontWeight: '600' as const,
        },
        toggleGroup: {
          flexDirection: 'row' as const,
          marginTop: theme.spacing.sm,
          marginHorizontal: -theme.spacing.xs,
        },
        toggleOption: {
          flex: 1,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          paddingVertical: theme.spacing.sm,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          marginHorizontal: theme.spacing.xs,
          backgroundColor: theme.colors.surface,
        },
        toggleOptionSelected: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        toggleText: {
          fontSize: 14,
          color: theme.colors.onMuted,
          fontWeight: '500' as const,
        },
        toggleTextSelected: {
          color: theme.colors.onPrimary,
          fontWeight: '600' as const,
        },
        textArea: {
          backgroundColor: theme.colors.bg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: 16,
          color: theme.colors.onSurface,
          textAlignVertical: 'top' as const,
          minHeight: 100,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pet Experience</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Experience *</Text>
        <View style={styles.optionsContainer}>
          {EXPERIENCE_OPTIONS.map((option) => {
            const isSelected = formData.experience === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.selectedOption]}
                testID={`AdoptionApplicationScreen-experience-${option.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select experience level ${option}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onUpdateForm('experience', option)}
              >
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Living Space *</Text>
        <View style={styles.optionsContainer}>
          {LIVING_SPACE_OPTIONS.map((option) => {
            const isSelected = formData.livingSpace === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.selectedOption]}
                testID={`AdoptionApplicationScreen-livingSpace-${option.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select living space ${option}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onUpdateForm('livingSpace', option)}
              >
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Do you have a fenced yard?</Text>
        <View style={styles.toggleGroup}>
          {YARD_CHOICES.map(({ label, value }) => {
            const isSelected = formData.hasYard === value;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.toggleOption, isSelected && styles.toggleOptionSelected]}
                testID={`AdoptionApplicationScreen-hasYard-${label.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${label} for fenced yard`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onUpdateForm('hasYard', value)}
              >
                <Text style={[styles.toggleText, isSelected && styles.toggleTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Other Pets</Text>
        <TextInput
          style={styles.textArea}
          value={formData.otherPets}
          onChangeText={(text) => onUpdateForm('otherPets', text)}
          placeholder="Tell us about any other pets you have..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
};

