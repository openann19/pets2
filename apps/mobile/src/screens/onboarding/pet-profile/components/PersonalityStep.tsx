/**
 * Personality Step Component
 * Third step: intent, personality tags, description
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { PetFormData } from '../types';
import { INTENT_OPTIONS, PERSONALITY_TAGS } from '../types';

interface PersonalityStepProps {
  formData: PetFormData;
  onUpdate: (field: string, value: string) => void;
  onToggleTag: (tag: string) => void;
}

export const PersonalityStep: React.FC<PersonalityStepProps> = ({
  formData,
  onUpdate,
  onToggleTag,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.onSurface }]}>Personality & Intent</Text>
      <Text style={[styles.stepSubtitle, { color: colors.onMuted }]}>What makes your pet special?</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>What are you looking for? *</Text>
        <View style={styles.optionsGrid}>
          {INTENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                formData.intent === option.value && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onUpdate('intent', option.value)}
              testID={`intent-option-${option.value}`}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.onMuted },
                  formData.intent === option.value && [styles.selectedOptionText, { color: colors.primary }],
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Personality Tags * (Select at least one)</Text>
        <View style={styles.tagsContainer}>
          {PERSONALITY_TAGS.slice(0, 12).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                formData.personalityTags.includes(tag) && [styles.selectedTag, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }],
              ]}
              onPress={() => onToggleTag(tag)}
              testID={`personality-tag-${tag}`}
              accessibilityLabel={tag}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.tagText,
                  { color: colors.onMuted },
                  formData.personalityTags.includes(tag) && [styles.selectedTagText, { color: colors.primary }],
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.onSurface }]}>Description (Optional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface },
          ]}
          value={formData.description}
          onChangeText={(text) => onUpdate('description', text)}
          placeholder="Tell us more about your pet's personality, habits, or special needs..."
          placeholderTextColor={colors.onMuted}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: theme.typography.h2.size * 1.2,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    stepSubtitle: {
      fontSize: theme.typography.body.size,
      marginBottom: theme.spacing.lg + theme.spacing.xs,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: theme.radii.sm,
      padding: theme.spacing.lg,
      fontSize: theme.typography.body.size,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    optionButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedOption: {
      borderWidth: 1,
    },
    optionText: {
      fontSize: theme.typography.body.size * 0.875,
    },
    selectedOptionText: {
      fontWeight: theme.typography.h2.weight,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tagButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    selectedTag: {
      borderWidth: 1,
    },
    tagText: {
      fontSize: theme.typography.body.size * 0.875,
    },
    selectedTagText: {
      fontWeight: theme.typography.h2.weight,
    },
  });
}

