import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PetFormData } from '../../hooks/usePetForm';

interface PetPersonalitySectionProps {
  formData: PetFormData;
  onUpdateFormData: (field: string, value: any) => void;
}

const personalityTags = [
  'friendly', 'energetic', 'playful', 'calm', 'shy', 'protective',
  'good-with-kids', 'good-with-pets', 'trained', 'house-trained', 'intelligent',
];

export const PetPersonalitySection: React.FC<PetPersonalitySectionProps> = ({
  formData,
  onUpdateFormData,
}) => {
  const togglePersonalityTag = (tag: string) => {
    onUpdateFormData(
      'personalityTags',
      formData.personalityTags.includes(tag)
        ? formData.personalityTags.filter(t => t !== tag)
        : [...formData.personalityTags, tag]
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
            style={[
              styles.tag,
              formData.personalityTags.includes(tag) && styles.tagSelected,
            ]}
            onPress={() => { togglePersonalityTag(tag); }}
          >
            <Text style={[
              styles.tagText,
              formData.personalityTags.includes(tag) && styles.tagTextSelected,
            ]}>
              {tag.replace('-', ' ')}
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
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
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
    borderColor: '#D1D5DB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  tagSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
  },
  tagTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
