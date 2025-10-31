import { useState } from 'react';
import { logger, type Pet } from '@pawfectmatch/core';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { matchesAPI } from '../services/api';
import type { RootStackParamList } from '../navigation/types';
import type { FormFieldValue } from '../types/forms';

export interface PetPhoto {
  uri: string;
  type: string;
  fileName?: string;
  isPrimary?: boolean;
  // Upload tracking
  isUploading?: boolean;
  uploadProgress?: { uploaded: number; total: number; percentage: number };
  uploadedUrl?: string;
  thumbnailUrl?: string;
  s3Key?: string;
  error?: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  intent: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    specialNeeds: boolean;
  };
}

export interface UsePetFormReturn {
  formData: PetFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (field: string, value: FormFieldValue) => void;
  validateForm: () => boolean;
  handleSubmit: (
    photos: PetPhoto[],
    navigation: NativeStackNavigationProp<RootStackParamList>,
  ) => Promise<void>;
}

export const usePetForm = (): UsePetFormReturn => {
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    intent: '',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
      specialNeeds: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: FormFieldValue) => {
    // Handle null values by ignoring them
    if (value === null) {
      return;
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof typeof formData;
      const childKey = child as string;

      setFormData((prev) => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey] as Record<string, unknown>),
          [childKey]: value,
        },
      }));
    } else {
      const fieldKey = field as keyof typeof formData;
      setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pet name is required';
    if (!formData.species) newErrors.species = 'Species is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (
      !formData.age ||
      isNaN(Number(formData.age)) ||
      Number(formData.age) < 0 ||
      Number(formData.age) > 30
    ) {
      newErrors.age = 'Age must be between 0 and 30 years';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.size) newErrors.size = 'Size is required';
    if (!formData.intent) newErrors.intent = 'Intent is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    photos: PetPhoto[],
    navigation: NativeStackNavigationProp<RootStackParamList>,
  ) => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create pet data
      const petData: Partial<Pet> = {
        name: formData.name,
        species: formData.species as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
        breed: formData.breed,
        age: Number(formData.age),
        gender: formData.gender as 'male' | 'female',
        size: formData.size as 'tiny' | 'small' | 'medium' | 'large' | 'extra-large',
        description: formData.description,
        intent: formData.intent as 'adoption' | 'mating' | 'playdate' | 'all',
        personalityTags: formData.personalityTags,
        healthInfo: formData.healthInfo,
      };

      logger.info('Creating pet:', { petData });

      // Create pet profile via API
      const createdPet = await matchesAPI.createPet(petData);

      // Check if there are photos that need upload or are still uploading
      const uploadingPhotos = photos.filter((p) => p.isUploading);
      const unuploadedPhotos = photos.filter((p) => !p.uploadedUrl && !p.isUploading && !p.error);

      if (uploadingPhotos.length > 0) {
        Alert.alert(
          'Upload in Progress',
          'Please wait for all photos to finish uploading before submitting.',
        );
        return;
      }

      if (unuploadedPhotos.length > 0) {
        Alert.alert(
          'Photos Not Uploaded',
          'Some photos failed to upload. Please remove them and try again.',
        );
        return;
      }

      // All photos are uploaded, save their URLs to the pet
      if (createdPet._id && photos.length > 0) {
        const photoUrls = photos.map((photo) => ({
          url: photo.uploadedUrl || photo.uri,
          thumbnailUrl: photo.thumbnailUrl,
          publicId: photo.s3Key,
          isPrimary: photo.isPrimary,
        }));

        // Update pet with photo URLs
        await matchesAPI.updatePet(createdPet._id, {
          photos: photoUrls,
        });
      }

      Alert.alert('Success!', 'Pet profile created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyPets'),
        },
      ]);
    } catch (error) {
      logger.error('Error creating pet:', { error });
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    validateForm,
    handleSubmit,
  };
};
