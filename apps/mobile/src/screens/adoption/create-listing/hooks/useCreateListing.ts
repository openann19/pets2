/**
 * Create Listing Hook
 * Manages form state and submission for creating pet listings
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { logger } from '@pawfectmatch/core';
import { request } from '../../../services/api';
import { pickAndUpload } from '../../../services/upload';
import type { PetListingFormData } from './types';

interface UseCreateListingProps {
  onSuccess: () => void;
}

export const useCreateListing = ({ onSuccess }: UseCreateListingProps) => {
  const [formData, setFormData] = useState<PetListingFormData>({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleHealthToggle = useCallback((field: keyof typeof formData.healthInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [field]: !prev.healthInfo[field],
      },
    }));
  }, []);

  const handlePersonalityToggle = useCallback((tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  }, []);

  const addPhoto = useCallback(async () => {
    if (isUploadingPhoto) return;

    try {
      setIsUploadingPhoto(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      const photoUrl = await pickAndUpload();
      if (photoUrl) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, photoUrl],
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        logger.info('Photo added to listing', { photoUrl });
      }
    } catch (error) {
      logger.error('Failed to add photo', { error });
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [isUploadingPhoto]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.breed || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const listingData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: formData.age,
        gender: formData.gender,
        size: formData.size,
        description: formData.description,
        personalityTags: formData.personalityTags,
        healthInfo: formData.healthInfo,
        photos: formData.photos,
      };

      await request('/api/adoption/listings', {
        method: 'POST',
        body: listingData,
      });

      Alert.alert('Success!', 'Your pet listing has been created successfully.', [
        {
          text: 'OK',
          onPress: onSuccess,
        },
      ]);
    } catch (error) {
      logger.error('Failed to create listing:', { error });
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess]);

  return {
    formData,
    isSubmitting,
    isUploadingPhoto,
    handleInputChange,
    handleHealthToggle,
    handlePersonalityToggle,
    addPhoto,
    handleSubmit,
    canSubmit: !!(formData.name && formData.breed && formData.description),
  };
};

