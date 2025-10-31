/**
 * Commitment Step Component
 * Final step of adoption application - commitment and agreement
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { useTheme } from '@/theme';
import type { ApplicationData } from '../types';
import { AGREEMENT_ITEMS } from '../types';

interface CommitmentStepProps {
  formData: ApplicationData;
  onUpdateForm: <K extends keyof ApplicationData>(field: K, value: ApplicationData[K]) => void;
}

export const CommitmentStep: React.FC<CommitmentStepProps> = ({ formData, onUpdateForm }) => {
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
        agreementContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.xl,
          marginTop: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        agreementTitle: {
          fontSize: 16,
          fontWeight: 'bold' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
        },
        agreementText: {
          fontSize: 14,
          color: theme.colors.onMuted,
          marginBottom: theme.spacing.xs,
          lineHeight: 20,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Commitment & Agreement</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Long-term Commitment *</Text>
        <TextInput
          style={styles.textArea}
          value={formData.commitment}
          onChangeText={(text) => onUpdateForm('commitment', text)}
          placeholder="Please explain your long-term commitment to caring for this pet, including financial responsibility, medical care, and what you would do if circumstances change..."
          multiline
          numberOfLines={5}
        />
      </View>

      <View style={styles.agreementContainer}>
        <Text style={styles.agreementTitle}>By submitting this application, I agree to:</Text>
        {AGREEMENT_ITEMS.map((item, index) => (
          <Text key={index} style={styles.agreementText}>
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
};

