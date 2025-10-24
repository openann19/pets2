import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PetFormData } from '../../hooks/usePetForm';

interface PetIntentHealthSectionProps {
  formData: PetFormData;
  errors: Record<string, string>;
  onUpdateFormData: (field: string, value: any) => void;
}

const intentOptions = [
  { value: 'adoption', label: 'Available for Adoption', emoji: '🏠' },
  { value: 'mating', label: 'Looking for Mates', emoji: '💕' },
  { value: 'playdate', label: 'Playdates Only', emoji: '🎾' },
  { value: 'all', label: 'Open to All', emoji: '🌟' },
];

const healthOptions = [
  { key: 'vaccinated', label: 'Vaccinated' },
  { key: 'spayedNeutered', label: 'Spayed/Neutered' },
  { key: 'microchipped', label: 'Microchipped' },
  { key: 'specialNeeds', label: 'Has Special Needs' },
];

export const PetIntentHealthSection: React.FC<PetIntentHealthSectionProps> = ({
  formData,
  errors,
  onUpdateFormData,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Intent & Health</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>What are you looking for? *</Text>
        <View style={styles.intentOptions}>
          {intentOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.intentButton,
                formData.intent === option.value && styles.intentButtonSelected,
              ]}
              onPress={() => { onUpdateFormData('intent', option.value); }}
            >
              <Text style={styles.intentEmoji}>{option.emoji}</Text>
              <Text style={[
                styles.intentText,
                formData.intent === option.value && styles.intentTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.intent && <Text style={styles.errorText}>{errors.intent}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Health Information</Text>
        <View style={styles.healthOptions}>
          {healthOptions.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.checkboxContainer}
              onPress={() => { onUpdateFormData(
                `healthInfo.${item.key}`,
                !formData.healthInfo[item.key as keyof typeof formData.healthInfo]
              ); }}
            >
              <View style={[
                styles.checkbox,
                formData.healthInfo[item.key as keyof typeof formData.healthInfo] && styles.checkboxChecked,
              ]}>
                {formData.healthInfo[item.key as keyof typeof formData.healthInfo] && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  intentOptions: {
    gap: 12,
  },
  intentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  intentButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  intentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intentText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  intentTextSelected: {
    color: '#8B5CF6',
  },
  healthOptions: {
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
});
