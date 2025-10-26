/**
 * PROJECT HYPERION: MODERNIZED CREATE PET SCREEN
 *
 * Demonstrates the new architecture with:
 * - ModernPhotoUpload component for premium photo handling
 * - EliteButton with composition pattern
 * - FXContainer for visual effects
 * - Unified typography system
 * - Staggered animations for form sections
 */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// Import new architecture components
import {
  Theme,
  EliteButton,
  EliteButtonPresets,
  FXContainerPresets,
  ModernPhotoUpload,
  Heading2,
  BodySmall,
  Label,
  useStaggeredAnimation,
} from "../components";

// Import legacy components for gradual migration
import { EliteContainer, EliteHeader } from "../components/EliteComponents";

import type { RootStackScreenProps } from "../../navigation/types";

type CreatePetScreenProps = RootStackScreenProps<"CreatePet">;

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

export default function ModernCreatePetScreen({
  navigation,
}: CreatePetScreenProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
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
      specialNeeds: "",
    },
    location: {
      city: "",
      state: "",
      zipCode: "",
    },
    contactInfo: {
      email: "",
      phone: "",
      preferredContact: "email",
    },
  });

  // Photo state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(
      6, // Number of form sections
      150,
      "gentle",
    );

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
  }, [startStaggeredAnimation]);

  // Form handlers
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

  // Validation
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Pet name is required");
    if (!formData.species) errors.push("Species is required");
    if (!formData.breed.trim()) errors.push("Breed is required");
    if (!formData.age) errors.push("Age is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (photos.length === 0) errors.push("At least one photo is required");
    if (!formData.contactInfo.email.trim()) errors.push("Email is required");

    return errors;
  }, [formData, photos]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Success!",
        "Your pet profile has been created successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("MyPets"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create pet profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, navigation]);

  // Species options
  const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

  // Gender options
  const genderOptions = ["Male", "Female", "Unknown"];

  // Size options
  const sizeOptions = ["Small", "Medium", "Large", "Extra Large"];

  // Intent options
  const intentOptions = ["Adoption", "Foster", "Rehoming", "Lost & Found"];

  // Personality tags
  const personalityTagOptions = [
    "Friendly",
    "Playful",
    "Calm",
    "Energetic",
    "Shy",
    "Confident",
    "Good with kids",
    "Good with other pets",
    "House trained",
    "Leash trained",
  ];

  const togglePersonalityTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  }, []);

  // Handler functions for form inputs
  const handleNameChange = useCallback(
    (value: string) => {
      updateFormData("name", value);
    },
    [updateFormData],
  );
  const handleSpeciesChange = useCallback(
    (species: string) => {
      updateFormData("species", species);
    },
    [updateFormData],
  );
  const handleBreedChange = useCallback(
    (value: string) => {
      updateFormData("breed", value);
    },
    [updateFormData],
  );
  const handleAgeChange = useCallback(
    (value: string) => {
      updateFormData("age", value);
    },
    [updateFormData],
  );
  const handleGenderChange = useCallback(
    (gender: string) => {
      updateFormData("gender", gender);
    },
    [updateFormData],
  );
  const handleSizeChange = useCallback(
    (size: string) => {
      updateFormData("size", size);
    },
    [updateFormData],
  );
  const handleDescriptionChange = useCallback(
    (value: string) => {
      updateFormData("description", value);
    },
    [updateFormData],
  );
  const handleIntentChange = useCallback(
    (intent: string) => {
      updateFormData("intent", intent);
    },
    [updateFormData],
  );
  const handleEmailChange = useCallback(
    (value: string) => {
      updateNestedFormData("contactInfo", "email", value);
    },
    [updateNestedFormData],
  );
  const handlePhoneChange = useCallback(
    (value: string) => {
      updateNestedFormData("contactInfo", "phone", value);
    },
    [updateNestedFormData],
  );

  return (
    <EliteContainer gradient="primary">
      <EliteHeader
        title="Create Pet Profile"
        subtitle="Share your pet with the community"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Upload Section */}
          <View style={getAnimatedStyle(0)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Pet Photos</Heading2>
              <BodySmall style={styles.sectionSubtitle}>
                Add up to 6 photos to showcase your pet
              </BodySmall>
              <ModernPhotoUpload
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={6}
              />
            </FXContainerPresets.glass>
          </View>

          {/* Basic Information */}
          <View style={getAnimatedStyle(1)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Basic Information</Heading2>

              <View style={styles.formGroup}>
                <Label>Pet Name *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  placeholder="Enter your pet's name"
                  placeholderTextColor={Theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Label>Species *</Label>
                <View style={styles.optionsContainer}>
                  {speciesOptions.map((species) => (
                    <EliteButton
                      key={species}
                      title={species}
                      variant={
                        formData.species === species ? "primary" : "outline"
                      }
                      size="sm"
                      onPress={() => {
                        handleSpeciesChange(species);
                      }}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Label>Breed *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={handleBreedChange}
                  placeholder="Enter breed"
                  placeholderTextColor={Theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Label>Age *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={handleAgeChange}
                  placeholder="e.g., 2 years, 6 months"
                  placeholderTextColor={Theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Label>Gender</Label>
                <View style={styles.optionsContainer}>
                  {genderOptions.map((gender) => (
                    <EliteButton
                      key={gender}
                      title={gender}
                      variant={
                        formData.gender === gender ? "primary" : "outline"
                      }
                      size="sm"
                      onPress={() => {
                        handleGenderChange(gender);
                      }}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Label>Size</Label>
                <View style={styles.optionsContainer}>
                  {sizeOptions.map((size) => (
                    <EliteButton
                      key={size}
                      title={size}
                      variant={formData.size === size ? "primary" : "outline"}
                      size="sm"
                      onPress={() => {
                        handleSizeChange(size);
                      }}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Description */}
          <View style={getAnimatedStyle(2)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Description</Heading2>
              <View style={styles.formGroup}>
                <Label>Tell us about your pet *</Label>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={handleDescriptionChange}
                  placeholder="Describe your pet's personality, habits, and what makes them special..."
                  placeholderTextColor={Theme.colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Intent */}
          <View style={getAnimatedStyle(3)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Intent</Heading2>
              <View style={styles.formGroup}>
                <Label>What are you looking for?</Label>
                <View style={styles.optionsContainer}>
                  {intentOptions.map((intent) => (
                    <EliteButton
                      key={intent}
                      title={intent}
                      variant={
                        formData.intent === intent ? "primary" : "outline"
                      }
                      size="sm"
                      onPress={() => {
                        handleIntentChange(intent);
                      }}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Personality Tags */}
          <View style={getAnimatedStyle(4)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>
                Personality & Traits
              </Heading2>
              <View style={styles.formGroup}>
                <Label>Select traits that describe your pet</Label>
                <View style={styles.tagsContainer}>
                  {personalityTagOptions.map((tag) => (
                    <EliteButton
                      key={tag}
                      title={tag}
                      variant={
                        formData.personalityTags.includes(tag)
                          ? "secondary"
                          : "outline"
                      }
                      size="sm"
                      onPress={() => {
                        togglePersonalityTag(tag);
                      }}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Contact Information */}
          <View style={getAnimatedStyle(5)}>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>
                Contact Information
              </Heading2>

              <View style={styles.formGroup}>
                <Label>Email *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.contactInfo.email}
                  onChangeText={handleEmailChange}
                  placeholder="your@email.com"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Label>Phone</Label>
                <TextInput
                  style={styles.input}
                  value={formData.contactInfo.phone}
                  onChangeText={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={Theme.colors.text.tertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <EliteButtonPresets.holographic
              title={
                isSubmitting ? "Creating Profile..." : "Create Pet Profile"
              }
              size="lg"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing["4xl"],
  },
  section: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    marginBottom: Theme.spacing.lg,
    color: Theme.colors.text.secondary,
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
  },
  input: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.light.default,
    ...Theme.shadows.depth.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  submitContainer: {
    paddingTop: Theme.spacing.xl,
  },
  submitButton: {
    width: "100%",
  },
});
