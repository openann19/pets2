/**
 * useAdoptionApplicationScreen Hook
 * Manages AdoptionApplicationScreen state and interactions
 * Extracts all form state, validation, and submission logic
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type AdoptionStackParamList = {
  AdoptionApplication: { petId: string; petName: string };
};

type AdoptionScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  "AdoptionApplication"
>;

export interface ApplicationData {
  experience: string;
  livingSpace: string;
  hasYard: boolean;
  otherPets: string;
  workSchedule: string;
  references: { name: string; phone: string; relationship: string }[];
  veterinarian: { name: string; clinic: string; phone: string };
  reason: string;
  commitment: string;
}

interface UseAdoptionApplicationScreenReturn {
  // State
  currentStep: number;
  formData: ApplicationData;
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateFormData: (field: string, value: import("../../types/forms").FormFieldValue) => void;
  updateReference: (index: number, field: string, value: string) => void;
  updateVeterinarian: (field: string, value: string) => void;
  
  // Validation & Navigation
  validateStep: () => boolean;
  handleNext: () => void;
  handleSubmit: () => Promise<void>;
  
  // Step rendering helpers
  renderStep: () => React.ReactNode;
  renderExperienceStep: () => React.ReactNode;
  renderLifestyleStep: () => React.ReactNode;
  renderReferencesStep: () => React.ReactNode;
  renderCommitmentStep: () => React.ReactNode;
  
  // Computed
  petId: string;
  petName: string;
}

export const useAdoptionApplicationScreen = (
  { navigation, route }: AdoptionScreenProps,
): UseAdoptionApplicationScreenReturn => {
  const { petId, petName } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationData>({
    experience: "",
    livingSpace: "",
    hasYard: false,
    otherPets: "",
    workSchedule: "",
    references: [
      { name: "", phone: "", relationship: "" },
      { name: "", phone: "", relationship: "" },
    ],
    veterinarian: { name: "", clinic: "", phone: "" },
    reason: "",
    commitment: "",
  });

  const updateFormData = useCallback(
    (field: string, value: import("../../types/forms").FormFieldValue) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateReference = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) =>
        i === index ? { ...ref, [field]: value } : ref,
      ),
    }));
  }, []);

  const updateVeterinarian = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      veterinarian: { ...prev.veterinarian, [field]: value },
    }));
  }, []);

  const validateStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        return !!(formData.experience && formData.livingSpace);
      case 1:
        return !!(formData.workSchedule && formData.reason);
      case 2:
        return !!(formData.references[0]!.name && formData.references[0]!.phone);
      case 3:
        return !!formData.commitment;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, validateStep]);

  const handleSubmit = useCallback(async () => {
    try {
      logger.info("Submitting application:", { petId, ...formData });
      Alert.alert(
        "Application Submitted!",
        `Your application for ${petName} has been submitted. The owner will review it and get back to you soon.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit application. Please try again.");
    }
  }, [petId, petName, formData, navigation]);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        return "experience"; // Will be rendered by parent
      case 1:
        return "lifestyle"; // Will be rendered by parent
      case 2:
        return "references"; // Will be rendered by parent
      case 3:
        return "commitment"; // Will be rendered by parent
      default:
        return null;
    }
  }, [currentStep]);

  // Stub renderers - actual rendering is done in the screen component
  const renderExperienceStep = useCallback(() => null, []);
  const renderLifestyleStep = useCallback(() => null, []);
  const renderReferencesStep = useCallback(() => null, []);
  const renderCommitmentStep = useCallback(() => null, []);

  return {
    currentStep,
    formData,
    setCurrentStep,
    updateFormData,
    updateReference,
    updateVeterinarian,
    validateStep,
    handleNext,
    handleSubmit,
    renderStep,
    renderExperienceStep,
    renderLifestyleStep,
    renderReferencesStep,
    renderCommitmentStep,
    petId,
    petName,
  };
};

