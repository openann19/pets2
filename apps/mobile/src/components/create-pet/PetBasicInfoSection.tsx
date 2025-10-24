import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PetFormData } from '../../hooks/usePetForm';

interface PetBasicInfoSectionProps {
  formData: PetFormData;
  errors: Record<string, string>;
  onUpdateFormData: (field: string, value: any) => void;
}

const speciesOptions = [
  { value: 'dog', label: 'Dog', emoji: '🐕' },
  { value: 'cat', label: 'Cat', emoji: '🐱' },
  { value: 'bird', label: 'Bird', emoji: '🐦' },
  { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { value: 'other', label: 'Other', emoji: '🐾' },
];

const sizeOptions = [
  { value: 'tiny', label: 'Tiny', desc: '< 5 lbs' },
  { value: 'small', label: 'Small', desc: '5-20 lbs' },
  { value: 'medium', label: 'Medium', desc: '20-50 lbs' },
  { value: 'large', label: 'Large', desc: '50-100 lbs' },
  { value: 'extra-large', label: 'Extra Large', desc: '> 100 lbs' },
];

export const PetBasicInfoSection: React.FC<PetBasicInfoSectionProps> = ({
  formData,
  errors,
  onUpdateFormData,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(value) => { onUpdateFormData('name', value); }}
          placeholder="Enter your pet's name"
          placeholderTextColor="#9CA3AF"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species *</Text>
        <View style={styles.optionsGrid}>
          {speciesOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.species === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => { onUpdateFormData('species', option.value); }}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={[
                styles.optionText,
                formData.species === option.value && styles.optionTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.species && <Text style={styles.errorText}>{errors.species}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={[styles.input, errors.breed && styles.inputError]}
          value={formData.breed}
          onChangeText={(value) => { onUpdateFormData('breed', value); }}
          placeholder="e.g., Golden Retriever, Siamese"
          placeholderTextColor="#9CA3AF"
        />
        {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Age (years) *</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            value={formData.age}
            onChangeText={(value) => { onUpdateFormData('age', value); }}
            placeholder="0-30"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderOptions}>
            {[
              { value: 'male', label: 'Male', emoji: '♂️' },
              { value: 'female', label: 'Female', emoji: '♀️' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderButton,
                  formData.gender === option.value && styles.genderButtonSelected,
                ]}
                onPress={() => { onUpdateFormData('gender', option.value); }}
              >
                <Text style={styles.genderEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.genderText,
                  formData.gender === option.value && styles.genderTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size *</Text>
        <View style={styles.sizeOptions}>
          {sizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sizeButton,
                formData.size === option.value && styles.sizeButtonSelected,
              ]}
              onPress={() => { onUpdateFormData('size', option.value); }}
            >
              <Text style={[
                styles.sizeLabel,
                formData.size === option.value && styles.sizeLabelSelected,
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.sizeDesc,
                formData.size === option.value && styles.sizeDescSelected,
              ]}>
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
          style={[styles.textArea]}
          value={formData.description}
          onChangeText={(value) => { onUpdateFormData('description', value); }}
          placeholder="Tell us about your pet's personality, habits, and what makes them special..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
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
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 100,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
    minWidth: 150,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#8B5CF6',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genderButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  genderEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  genderText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#8B5CF6',
  },
  sizeOptions: {
    gap: 8,
  },
  sizeButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sizeButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  sizeLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  sizeLabelSelected: {
    color: '#8B5CF6',
  },
  sizeDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sizeDescSelected: {
    color: '#7C3AED',
  },
});
