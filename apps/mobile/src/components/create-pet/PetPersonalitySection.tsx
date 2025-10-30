import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { PetFormData } from '../../hooks/usePetForm';
import type { FormFieldValue } from '../../types/forms';
import { useTheme } from '@/theme';

interface PetPersonalitySectionProps {
  formData: PetFormData;
  onUpdateFormData: (field: string, value: FormFieldValue) => void;
}

const personalityTags = [
  'friendly',
  'energetic',
  'playful',
  'calm',
  'shy',
  'protective',
  'good-with-kids',
  'good-with-pets',
  'trained',
  'house-trained',
  'intelligent',
];

export const PetPersonalitySection: React.FC<PetPersonalitySectionProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const toggleTag = (tag: string) => {
    onUpdateFormData(
      'personalityTags',
      formData.personalityTags.includes(tag)
        ? formData.personalityTags.filter((t) => t !== tag)
        : [...formData.personalityTags, tag],
    );
  };

  const makeStyles = (theme: any) =>
    StyleSheet.create({
      section: {
        marginBottom: 32,
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        marginBottom: 16,
      },
      sectionDesc: {
        fontSize: 14,
        color: theme.colors.onMuted,
        marginBottom: 16,
      },
      tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      },
      tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 16,
        backgroundColor: theme.colors.bg,
      },
      tagSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
      },
      tagText: {
        fontSize: 14,
        color: theme.colors.onMuted,
      },
      tagTextSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
      },
    });

  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personality & Traits</Text>
      <Text style={styles.sectionDesc}>Select tags that best describe your pet's personality</Text>

      <View style={styles.tagsContainer}>
        {personalityTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={StyleSheet.flatten([
              styles.tag,
              formData.personalityTags.includes(tag) && styles.tagSelected,
            ])}
            onPress={() => {
              toggleTag(tag);
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.tagText,
                formData.personalityTags.includes(tag) && styles.tagTextSelected,
              ])}
            >
              {tag.replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
