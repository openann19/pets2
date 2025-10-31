/**
 * Lifestyle Step Component
 * Second step of adoption application - work schedule and adoption reason
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { useTheme } from '@/theme';
import type { ApplicationData } from '../types';

interface LifestyleStepProps {
  formData: ApplicationData;
  petName: string;
  onUpdateForm: <K extends keyof ApplicationData>(field: K, value: ApplicationData[K]) => void;
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({ formData, petName, onUpdateForm }) => {
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
        input: {
          backgroundColor: theme.colors.bg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: 16,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
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
      <Text style={styles.stepTitle}>Lifestyle & Schedule</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Work Schedule *</Text>
        <TextInput
          style={styles.input}
          value={formData.workSchedule}
          onChangeText={(text) => onUpdateForm('workSchedule', text)}
          placeholder="e.g., 9-5 weekdays, work from home, etc."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Why do you want to adopt {petName}? *</Text>
        <TextInput
          style={styles.textArea}
          value={formData.reason}
          onChangeText={(text) => onUpdateForm('reason', text)}
          placeholder="Tell us what draws you to this pet and what you hope to provide..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );
};

