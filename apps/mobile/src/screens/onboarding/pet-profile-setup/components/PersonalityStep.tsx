/**
 * Personality & Intent Step Component
 */

import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { PetFormData } from '../types';
import { INTENT_OPTIONS, PERSONALITY_TAGS } from '../types';

interface PersonalityStepProps {
  formData: PetFormData;
  updateFormData: (field: string, value: any) => void;
  togglePersonalityTag: (tag: string) => void;
}

export const PersonalityStep: React.FC<PersonalityStepProps> = ({
  formData,
  updateFormData,
  togglePersonalityTag,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personality & Intent</Text>
      <Text style={styles.stepSubtitle}>What makes your pet special?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>What are you looking for? *</Text>
        <View style={styles.optionsGrid}>
          {INTENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.intent === option.value && styles.selectedOption,
              ]}
              testID="PersonalityStep-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => updateFormData('intent', option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.intent === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Personality Tags * (Select at least one)</Text>
        <View style={styles.tagsContainer}>
          {PERSONALITY_TAGS.slice(0, 12).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                formData.personalityTags.includes(tag) && styles.selectedTag,
              ]}
              testID="PersonalityStep-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => togglePersonalityTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  formData.personalityTags.includes(tag) && styles.selectedTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Tell us more about your pet's personality, habits, or special needs..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginBottom: 32,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: '#fdf2f8',
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: '500',
    },
    selectedOptionText: {
      color: '#ec4899',
      fontWeight: '600',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagButton: {
      backgroundColor: '#f3f4f6',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    selectedTag: {
      backgroundColor: '#ec4899',
    },
    tagText: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: '500',
    },
    selectedTagText: {
      color: '#ffffff',
    },
  });
