/**
 * Pet Information Form Component
 * Production-hardened component for collecting pet details
 * Features: Form validation, accessibility, responsive design
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { TextInput } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface PetInfoFormProps {
  petName: string;
  setPetName: (name: string) => void;
  petBreed: string;
  setPetBreed: (breed: string) => void;
  petAge: string;
  setPetAge: (age: string) => void;
  petPersonality: string;
  setPetPersonality: (personality: string) => void;
  validationErrors: Record<string, string>;
}

export function PetInfoForm({
  petName,
  setPetName,
  petBreed,
  setPetBreed,
  petAge,
  setPetAge,
  petPersonality,
  setPetPersonality,
  validationErrors,
}: PetInfoFormProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pet Information</Text>
      <Text style={styles.sectionSubtitle}>Tell us about your furry friend</Text>

      {/* Pet Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={[styles.input, validationErrors.petName ? styles.inputError : undefined]}
          value={petName}
          onChangeText={setPetName}
          placeholder="Enter your pet's name"
          placeholderTextColor={theme.colors.onMuted as ColorValue}
          maxLength={50}
        />
        {validationErrors.petName && (
          <Text style={styles.errorText}>{validationErrors.petName}</Text>
        )}
      </View>

      {/* Pet Breed Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Breed *</Text>
        <TextInput
          style={[styles.input, validationErrors.petBreed ? styles.inputError : undefined]}
          value={petBreed}
          onChangeText={setPetBreed}
          placeholder="e.g., Golden Retriever, Mixed Breed"
          placeholderTextColor={theme.colors.onMuted as ColorValue}
          maxLength={100}
        />
        {validationErrors.petBreed && (
          <Text style={styles.errorText}>{validationErrors.petBreed}</Text>
        )}
      </View>

      {/* Pet Age Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Age *</Text>
        <TextInput
          style={[styles.input, validationErrors.petAge ? styles.inputError : undefined]}
          value={petAge}
          onChangeText={setPetAge}
          placeholder="e.g., 2 years old, 6 months"
          placeholderTextColor={theme.colors.onMuted as ColorValue}
          maxLength={50}
        />
        {validationErrors.petAge && <Text style={styles.errorText}>{validationErrors.petAge}</Text>}
      </View>

      {/* Pet Personality Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Personality *</Text>
        <TextInput
          style={[styles.textarea, validationErrors.petPersonality ? styles.inputError : undefined]}
          value={petPersonality}
          onChangeText={setPetPersonality}
          placeholder="Describe your pet's personality, habits, and quirks (e.g., energetic, loves belly rubs, afraid of thunderstorms)"
          placeholderTextColor={theme.colors.onMuted as ColorValue}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />
        {validationErrors.petPersonality && (
          <Text style={styles.errorText}>{validationErrors.petPersonality}</Text>
        )}
        <Text style={styles.characterCount}>{petPersonality.length}/500 characters</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
    },
    textarea: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
      minHeight: 100,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    errorText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.danger,
      marginTop: theme.spacing.xs,
    },
    characterCount: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'right',
      marginTop: theme.spacing.xs,
    },
  });
}
