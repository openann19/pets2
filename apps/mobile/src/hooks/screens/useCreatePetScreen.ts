import { logger } from '@pawfectmatch/core';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface PhotoItem {
  id: string;
  uri: string;
  isUploading?: boolean;
  error?: string;
}

interface FormData {
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
    specialNeeds: string;
  };
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    preferredContact: string;
  };
}

export function useCreatePetScreen() {
  const [formData, setFormData] = useState<FormData>({
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
      specialNeeds: '',
    },
    location: {
      city: '',
      state: '',
      zipCode: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      preferredContact: 'email',
    },
  });

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback(
    (field: keyof FormData, value: string | boolean | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const updateNestedFormData = useCallback(
    (section: keyof FormData, field: string, value: string | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, unknown>),
          [field]: value,
        },
      }));
    },
    [],
  );

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push('Pet name is required');
    if (!formData.species) errors.push('Species is required');
    if (!formData.breed.trim()) errors.push('Breed is required');
    if (!formData.age) errors.push('Age is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (photos.length === 0) errors.push('At least one photo is required');
    if (!formData.contactInfo.email.trim()) errors.push('Email is required');

    return errors;
  }, [formData, photos]);

  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return { success: false };
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      logger.info('Pet profile created successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to create pet profile:', { error });
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm]);

  const togglePersonalityTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  }, []);

  return {
    formData,
    photos,
    isSubmitting,
    updateFormData,
    updateNestedFormData,
    setPhotos,
    handleSubmit,
    togglePersonalityTag,
  };
}
