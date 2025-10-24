import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PetBasicInfoSection } from '../components/create-pet/PetBasicInfoSection';
import { PetFormSubmit } from '../components/create-pet/PetFormSubmit';
import { PetIntentHealthSection } from '../components/create-pet/PetIntentHealthSection';
import { PetPersonalitySection } from '../components/create-pet/PetPersonalitySection';
import { PetPhotosSection } from '../components/create-pet/PetPhotosSection';
import { usePetForm } from '../hooks/usePetForm';
import { usePhotoManager } from '../hooks/usePhotoManager';

type RootStackParamList = {
  CreatePet: undefined;
  MyPets: undefined;
  Home: undefined;
};

type CreatePetScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePet'>;

export default function CreatePetScreen({ navigation }: CreatePetScreenProps) {
  const {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    handleSubmit,
  } = usePetForm();

  const {
    photos,
    pickImage,
    removePhoto,
    setPrimaryPhoto,
  } = usePhotoManager();

  const onSubmit = () => {
    handleSubmit(photos, navigation);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Pet Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Sections */}
          <PetBasicInfoSection
            formData={formData}
            errors={errors}
            onUpdateFormData={updateFormData}
          />

          <PetPersonalitySection
            formData={formData}
            onUpdateFormData={updateFormData}
          />

          <PetIntentHealthSection
            formData={formData}
            errors={errors}
            onUpdateFormData={updateFormData}
          />

          <PetPhotosSection
            photos={photos}
            errors={errors}
            onPickImage={pickImage}
            onRemovePhoto={removePhoto}
            onSetPrimaryPhoto={setPrimaryPhoto}
          />

          <PetFormSubmit
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
