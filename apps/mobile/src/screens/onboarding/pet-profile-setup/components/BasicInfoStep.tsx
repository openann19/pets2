/**
 * Basic Info Step Component
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { PetFormData } from "../types";
import { SPECIES_OPTIONS } from "../types";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    textAlign: "center",
  },
  selectedOptionText: {
    fontWeight: "600",
  },
});
}


interface BasicInfoStepProps {
  formData: PetFormData;
  updateFormData: (field: string, value: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData }) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>Basic Information</Text>
      <Text style={[styles.stepSubtitle, { color: colors.onMuted }]}>Tell us about your pet</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Pet Name *</Text>
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          value={formData.name}
          onChangeText={(text) => updateFormData("name", text)}
          placeholder="e.g., Buddy, Luna, Max"
          placeholderTextColor={colors.onMuted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Species *</Text>
        <View style={styles.optionsGrid}>
          {SPECIES_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.species === option.value && styles.selectedOption,
                { backgroundColor: formData.species === option.value ? colors.primary : colors.surface },
              ]}
              onPress={() => updateFormData("species", option.value)}
              accessibilityLabel={`Select ${option.label}`}
              accessibilityRole="button"
              testID={`species-${option.value}`}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.species === option.value && styles.selectedOptionText,
                  { color: formData.species === option.value ? colors.onSurface : colors.onMuted },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Breed *</Text>
        <TextInput
          style={[styles.input, { color: colors.onSurface, borderColor: colors.border }]}
          value={formData.breed}
          onChangeText={(text) => updateFormData("breed", text)}
          placeholder="e.g., Golden Retriever, Persian Cat"
          placeholderTextColor={colors.onMuted}
        />
      </View>
    </View>
  );
};
