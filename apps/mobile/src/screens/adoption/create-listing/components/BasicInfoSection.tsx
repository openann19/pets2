/**
 * Basic Info Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeStyleSheet as StyleSheet } from '@/utils/styleSheet';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { PetListingFormData } from '../types';

interface BasicInfoSectionProps {
  formData: PetListingFormData;
  onInputChange: (field: string, value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onInputChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Basic Information</Text>
      <BlurView intensity={20} style={[styles.sectionCard, { borderRadius: theme.radii.md }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Pet Name *</Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
            value={formData.name}
            onChangeText={(value) => onInputChange('name', value)}
            placeholder="Enter pet's name"
            placeholderTextColor={colors.onMuted}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Species *</Text>
            <View style={styles.radioGroup}>
              {['dog', 'cat'].map((species) => (
                <TouchableOpacity
                  key={species}
                  style={[
                    styles.radioButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    formData.species === species && [
                      styles.radioButtonActive,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ],
                  ]}
                  onPress={() => onInputChange('species', species)}
                  testID={`species-${species}`}
                  accessibilityLabel={species}
                  accessibilityRole="radio"
                >
                  <Text
                    style={[
                      styles.radioText,
                      { color: formData.species === species ? colors.onPrimary : colors.onMuted },
                    ]}
                  >
                    {species.charAt(0).toUpperCase() + species.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Gender</Text>
            <View style={styles.radioGroup}>
              {['male', 'female'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.radioButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    formData.gender === gender && [
                      styles.radioButtonActive,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ],
                  ]}
                  onPress={() => onInputChange('gender', gender)}
                  testID={`gender-${gender}`}
                  accessibilityLabel={gender}
                  accessibilityRole="radio"
                >
                  <Text
                    style={[
                      styles.radioText,
                      { color: formData.gender === gender ? colors.onPrimary : colors.onMuted },
                    ]}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Breed *</Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
            value={formData.breed}
            onChangeText={(value) => onInputChange('breed', value)}
            placeholder="Enter breed"
            placeholderTextColor={colors.onMuted}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Age</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface }]}
              value={formData.age}
              onChangeText={(value) => onInputChange('age', value)}
              placeholder="e.g., 2 years"
              keyboardType="numeric"
              placeholderTextColor={colors.onMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Size</Text>
            <View style={styles.radioGroup}>
              {['small', 'medium', 'large'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.radioButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    formData.size === size && [
                      styles.radioButtonActive,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ],
                  ]}
                  onPress={() => onInputChange('size', size)}
                  testID={`size-${size}`}
                  accessibilityLabel={size}
                  accessibilityRole="radio"
                >
                  <Text
                    style={[
                      styles.radioText,
                      { color: formData.size === size ? colors.onPrimary : colors.onMuted },
                    ]}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    formGroup: {
      marginBottom: theme.spacing.md,
      flex: 1,
    },
    formRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: theme.radii.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
    },
    radioGroup: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    radioButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      alignItems: 'center',
    },
    radioButtonActive: {
      borderWidth: 1,
    },
    radioText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

