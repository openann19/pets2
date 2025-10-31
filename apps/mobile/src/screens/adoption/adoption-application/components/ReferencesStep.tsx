/**
 * References Step Component
 * Third step of adoption application - references and veterinarian
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { ApplicationData } from '../types';

interface ReferencesStepProps {
  formData: ApplicationData;
  onUpdateReference: (index: number, field: string, value: string) => void;
  onUpdateVeterinarian: (field: string, value: string) => void;
}

export const ReferencesStep: React.FC<ReferencesStepProps> = ({
  formData,
  onUpdateReference,
  onUpdateVeterinarian,
}) => {
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
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
          marginTop: theme.spacing.sm,
        },
        referenceContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        referenceTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
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
      }),
    [theme],
  );

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>References & Veterinarian</Text>

      <Text style={styles.sectionTitle}>Personal References</Text>
      {formData.references.map((ref, index) => (
        <View key={index} style={styles.referenceContainer}>
          <Text style={styles.referenceTitle}>
            Reference {index + 1} {index === 0 ? '*' : ''}
          </Text>
          <TextInput
            style={styles.input}
            value={ref.name}
            onChangeText={(text) => onUpdateReference(index, 'name', text)}
            placeholder="Full Name"
          />
          <TextInput
            style={styles.input}
            value={ref.phone}
            onChangeText={(text) => onUpdateReference(index, 'phone', text)}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={ref.relationship}
            onChangeText={(text) => onUpdateReference(index, 'relationship', text)}
            placeholder="Relationship (friend, family, etc.)"
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Veterinarian (Optional)</Text>
      <TextInput
        style={styles.input}
        value={formData.veterinarian.name}
        onChangeText={(text) => onUpdateVeterinarian('name', text)}
        placeholder="Veterinarian Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.clinic}
        onChangeText={(text) => onUpdateVeterinarian('clinic', text)}
        placeholder="Clinic Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.phone}
        onChangeText={(text) => onUpdateVeterinarian('phone', text)}
        placeholder="Clinic Phone"
        keyboardType="phone-pad"
      />
    </View>
  );
};

