import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { PetFormData } from "../../hooks/usePetForm";
import type { FormFieldValue } from "../../types/forms";
import { Theme } from '../theme/unified-theme';

interface PetPersonalitySectionProps {
  formData: PetFormData;
  onUpdateFormData: (field: string, value: FormFieldValue) => void;
}

const personalityTags = [
  "friendly",
  "energetic",
  "playful",
  "calm",
  "shy",
  "protective",
  "good-with-kids",
  "good-with-pets",
  "trained",
  "house-trained",
  "intelligent",
];

export const PetPersonalitySection: React.FC<PetPersonalitySectionProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const togglePersonalityTag = (tag: string) => {
    onUpdateFormData(
      "personalityTags",
      formData.personalityTags.includes(tag)
        ? formData.personalityTags.filter((t) => t !== tag)
        : [...formData.personalityTags, tag],
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personality & Traits</Text>
      <Text style={styles.sectionDesc}>
        Select all that apply to help us find better matches:
      </Text>

      <View style={styles.tagsContainer}>
        {personalityTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={StyleSheet.flatten([
              styles.tag,
              formData.personalityTags.includes(tag) && styles.tagSelected,
            ])}
            onPress={() => {
              togglePersonalityTag(tag);
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.tagText,
                formData.personalityTags.includes(tag) &&
                  styles.tagTextSelected,
              ])}
            >
              {tag.replace("-", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[900]",
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[300]",
    borderRadius: 16,
    backgroundColor: "Theme.colors.neutral[0]",
  },
  tagSelected: {
    borderColor: "Theme.colors.secondary[500]",
    backgroundColor: "Theme.colors.neutral[100]",
  },
  tagText: {
    fontSize: 14,
    color: "Theme.colors.neutral[700]",
  },
  tagTextSelected: {
    color: "Theme.colors.secondary[500]",
    fontWeight: "600",
  },
});
