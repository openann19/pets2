import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { PetFormData } from "../../hooks/usePetForm";

import type { FormFieldValue } from "../../types/forms";
import { useTheme } from '../../theme/Provider';

interface PetBasicInfoSectionProps {
  formData: PetFormData;
  errors: Record<string, string>;
  onUpdateFormData: (field: string, value: FormFieldValue) => void;
}

const speciesOptions = [
  { value: "dog", label: "Dog", emoji: "🐕" },
  { value: "cat", label: "Cat", emoji: "🐱" },
  { value: "bird", label: "Bird", emoji: "🐦" },
  { value: "rabbit", label: "Rabbit", emoji: "🐰" },
  { value: "other", label: "Other", emoji: "🐾" },
];

const sizeOptions = [
  { value: "tiny", label: "Tiny", desc: "< 5 lbs" },
  { value: "small", label: "Small", desc: "5-20 lbs" },
  { value: "medium", label: "Medium", desc: "20-50 lbs" },
  { value: "large", label: "Large", desc: "50-100 lbs" },
  { value: "extra-large", label: "Extra Large", desc: "> 100 lbs" },
];

export const PetBasicInfoSection: React.FC<PetBasicInfoSectionProps> = ({
  formData,
  errors,
  onUpdateFormData,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={StyleSheet.flatten([
            styles.input,
            errors.name ? styles.inputError : undefined,
          ])}
          value={formData.name}
          onChangeText={(value) => {
            onUpdateFormData("name", value);
          }}
          placeholder="Enter your pet's name"
          placeholderTextColor="#9ca3af"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species *</Text>
        <View style={styles.optionsGrid}>
          {speciesOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.species === option.value &&
                  styles.optionButtonSelected,
              ])}
              onPress={() => {
                onUpdateFormData("species", option.value);
              }}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.species === option.value &&
                    styles.optionTextSelected,
                ])}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.species && (
          <Text style={styles.errorText}>{errors.species}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={StyleSheet.flatten([
            styles.input,
            errors.breed ? styles.inputError : undefined,
          ])}
          value={formData.breed}
          onChangeText={(value) => {
            onUpdateFormData("breed", value);
          }}
          placeholder="e.g., Golden Retriever, Siamese"
          placeholderTextColor="#9ca3af"
        />
        {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
      </View>

      <View style={styles.row}>
        <View style={StyleSheet.flatten([styles.inputGroup, styles.flex1])}>
          <Text style={styles.label}>Age (years) *</Text>
          <TextInput
            style={StyleSheet.flatten([
              styles.input,
              errors.age ? styles.inputError : undefined,
            ])}
            value={formData.age}
            onChangeText={(value) => {
              onUpdateFormData("age", value);
            }}
            placeholder="0-30"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        <View
          style={StyleSheet.flatten([
            styles.inputGroup,
            styles.flex1,
            styles.marginLeft,
          ])}
        >
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderOptions}>
            {[
              { value: "male", label: "Male", emoji: "♂️" },
              { value: "female", label: "Female", emoji: "♀️" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={StyleSheet.flatten([
                  styles.genderButton,
                  formData.gender === option.value &&
                    styles.genderButtonSelected,
                ])}
                onPress={() => {
                  onUpdateFormData("gender", option.value);
                }}
              >
                <Text style={styles.genderEmoji}>{option.emoji}</Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.genderText,
                    formData.gender === option.value &&
                      styles.genderTextSelected,
                  ])}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size *</Text>
        <View style={styles.sizeOptions}>
          {sizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.sizeButton,
                formData.size === option.value && styles.sizeButtonSelected,
              ])}
              onPress={() => {
                onUpdateFormData("size", option.value);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.sizeLabel,
                  formData.size === option.value && styles.sizeLabelSelected,
                ])}
              >
                {option.label}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.sizeDesc,
                  formData.size === option.value && styles.sizeDescSelected,
                ])}
              >
                {option.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={StyleSheet.flatten([styles.textArea])}
          value={formData.description}
          onChangeText={(value) => {
            onUpdateFormData("description", value);
          }}
          placeholder="Tell us about your pet..."
          placeholderTextColor="#9ca3af"
          multiline
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>
    </View>
  );
};

const makeStyles = (theme: any) => StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.neutral[900],
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.neutral[0],
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.status.error,
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.neutral[0],
    height: 100,
  },
  row: {
    flexDirection: "row",
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[0],
    flex: 1,
    minWidth: 150,
    justifyContent: "center",
  },
  optionButtonSelected: {
    borderColor: theme.colors.secondary[500],
    backgroundColor: theme.colors.neutral[100],
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontWeight: "500",
  },
  optionTextSelected: {
    color: theme.colors.secondary[500],
  },
  genderOptions: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[0],
  },
  genderButtonSelected: {
    borderColor: theme.colors.secondary[500],
    backgroundColor: theme.colors.neutral[100],
  },
  genderEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  genderText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontWeight: "500",
  },
  genderTextSelected: {
    color: theme.colors.secondary[500],
  },
  sizeOptions: {
    gap: 8,
  },
  sizeButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[0],
    alignItems: "center",
  },
  sizeButtonSelected: {
    borderColor: theme.colors.secondary[500],
    backgroundColor: theme.colors.neutral[100],
  },
  sizeLabel: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    fontWeight: "600",
  },
  sizeLabelSelected: {
    color: theme.colors.secondary[500],
  },
  sizeDesc: {
    fontSize: 12,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  sizeDescSelected: {
    color: theme.colors.secondary[500],
  },
});
