import { useState } from "react";
import { logger } from "@pawfectmatch/core";
import { Alert } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { matchesAPI } from "../services/api";
import type { RootStackParamList } from "../navigation/types";

export interface PetPhoto {
  uri: string;
  type: string;
  fileName?: string;
  isPrimary?: boolean;
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
  updateFormData: (field: string, value: string | boolean | string[]) => void;
  validateForm: () => boolean;
  handleSubmit: (
    photos: PetPhoto[],
    navigation: NativeStackNavigationProp<RootStackParamList>,
  ) => Promise<void>;
}

export const usePetForm = (): UsePetFormReturn => {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    intent: "",
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

  const updateFormData = (
    field: string,
    value: string | boolean | string[],
  ) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Pet name is required";
    if (!formData.species) newErrors.species = "Species is required";
    if (!formData.breed.trim()) newErrors.breed = "Breed is required";
    if (
      !formData.age ||
      isNaN(Number(formData.age)) ||
      Number(formData.age) < 0 ||
      Number(formData.age) > 30
    ) {
      newErrors.age = "Age must be between 0 and 30 years";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.size) newErrors.size = "Size is required";
    if (!formData.intent) newErrors.intent = "Intent is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    photos: PetPhoto[],
    navigation: NativeStackNavigationProp<RootStackParamList>,
  ) => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("Photos Required", "Please add at least one photo");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create pet data
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: Number(formData.age),
        gender: formData.gender,
        size: formData.size,
        description: formData.description,
        intent: formData.intent,
        personalityTags: formData.personalityTags,
        healthInfo: formData.healthInfo,
      };

      logger.info("Creating pet:", { petData });

      // Create pet profile via API
      const createdPet = await matchesAPI.createPet(petData);

      // Upload photos if pet was created successfully
      if (createdPet._id && photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append("photos", {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName || `photo_${index}.jpg`,
          } as unknown as Blob);
        });

        await matchesAPI.uploadPetPhotos(createdPet._id, formData);
      }

      Alert.alert("Success!", "Pet profile created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MyPets"),
        },
      ]);
    } catch (error) {
      logger.error("Error creating pet:", { error });
      Alert.alert("Error", "Failed to create pet profile. Please try again.");
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
