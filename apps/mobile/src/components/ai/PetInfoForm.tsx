/**
 * Pet Information Form Component
 * Production-hardened component for collecting pet details
 * Features: Form validation, accessibility, responsive design
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native";

import { Theme } from "../../theme/unified-theme";
import {
  getTextColor,
  getTextColorString,
  getBorderColor,
  getBackgroundColor,
  getStatusColor,
} from "../../theme/helpers";

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
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Pet Information</Text>
      <Text style={styles.sectionSubtitle}>
        Tell us about your furry friend
      </Text>

      {/* Pet Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.petName ? styles.inputError : null,
          ]}
          value={petName}
          onChangeText={setPetName}
          placeholder="Enter your pet's name"
          placeholderTextColor={getTextColorString("secondary")}
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
          style={[
            styles.input,
            validationErrors.petBreed ? styles.inputError : null,
          ]}
          value={petBreed}
          onChangeText={setPetBreed}
          placeholder="e.g., Golden Retriever, Mixed Breed"
          placeholderTextColor={getTextColorString("secondary")}
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
          style={[
            styles.input,
            validationErrors.petAge ? styles.inputError : null,
          ]}
          value={petAge}
          onChangeText={setPetAge}
          placeholder="e.g., 2 years old, 6 months"
          placeholderTextColor={getTextColorString("secondary")}
          maxLength={50}
        />
        {validationErrors.petAge && (
          <Text style={styles.errorText}>{validationErrors.petAge}</Text>
        )}
      </View>

      {/* Pet Personality Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Personality *</Text>
        <TextInput
          style={[
            styles.textarea,
            validationErrors.petPersonality ? styles.inputError : null,
          ]}
          value={petPersonality}
          onChangeText={setPetPersonality}
          placeholder="Describe your pet's personality, habits, and quirks (e.g., energetic, loves belly rubs, afraid of thunderstorms)"
          placeholderTextColor={getTextColorString("secondary")}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />
        {validationErrors.petPersonality && (
          <Text style={styles.errorText}>
            {validationErrors.petPersonality}
          </Text>
        )}
        <Text style={styles.characterCount}>
          {petPersonality.length}/500 characters
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: getTextColor().primary,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: getTextColorString("secondary"),
    marginBottom: Theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: getTextColor().primary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: getBorderColor("light"),
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: getTextColor().primary,
    backgroundColor: getBackgroundColor().primary,
  },
  textarea: {
    borderWidth: 1,
    borderColor: getBorderColor("light"),
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: getTextColor().primary,
    backgroundColor: getBackgroundColor().primary,
    minHeight: 100,
  },
  inputError: {
    borderColor: getStatusColor("error"),
  },
  errorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: getStatusColor("error"),
    marginTop: Theme.spacing.xs,
  },
  characterCount: {
    fontSize: Theme.typography.fontSize.xs,
    color: getTextColorString("secondary"),
    textAlign: "right",
    marginTop: Theme.spacing.xs,
  },
});
