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
import React from "react";
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
import { useCreatePetScreen } from "../hooks/screens/useCreatePetScreen";

import type { RootStackScreenProps } from "../navigation/types";

type CreatePetScreenProps = RootStackScreenProps<"CreatePet">;

export default function ModernCreatePetScreen({
  navigation,
}: CreatePetScreenProps) {
  const {
    formData,
    photos,
    isSubmitting,
    updateFormData,
    updateNestedFormData,
    setPhotos,
    handleSubmit,
    togglePersonalityTag,
  } = useCreatePetScreen();

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(6);

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
  }, [startStaggeredAnimation]);

  // Submit handler
  const onSubmit = async () => {
    const result = await handleSubmit();
    if (result?.success) {
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
    }
  };

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
          <View>
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
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Basic Information</Heading2>

              <View style={styles.formGroup}>
                <Label>Pet Name *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => updateFormData("name", value)}
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
                      onPress={() => updateFormData("species", species)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Label>Breed *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={(value) => updateFormData("breed", value)}
                  placeholder="Enter breed"
                  placeholderTextColor={Theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Label>Age *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(value) => updateFormData("age", value)}
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
                      onPress={() => updateFormData("gender", gender)}
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
                      onPress={() => updateFormData("size", size)}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Description */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Description</Heading2>
              <View style={styles.formGroup}>
                <Label>Tell us about your pet *</Label>
                <TextInput
                  style={StyleSheet.flatten([styles.input, styles.textArea])}
                  value={formData.description}
                  onChangeText={(value) => updateFormData("description", value)}
                  placeholder="Describe your pet's personality, habits, and what makes them special..."
                  placeholderTextColor={Theme.colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Intent */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Intent</Heading2>
              <View style={styles.formGroup}>
                <Label>What are you looking for?</Label>
                <View style={styles.optionsContainer}>
                  {intentOptions.map((intent) => (
                    <EliteButton
                      key={intent}
                      title={intent.charAt(0).toUpperCase() + intent.slice(1)}
                      variant={
                        formData.intent === intent ? "primary" : "outline"
                      }
                      size="sm"
                      onPress={() => updateFormData("intent", intent)}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Personality Tags */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>
                Personality & Traits
              </Heading2>
              <View style={styles.formGroup}>
                <Label>Select traits that describe your pet</Label>
                <View style={styles.optionsContainer}>
                  {personalityTagOptions.map((tag) => (
                    <EliteButton
                      key={tag}
                      title={tag}
                      variant={
                        formData.personalityTags.includes(tag)
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onPress={() => togglePersonalityTag(tag)}
                    />
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Contact Information */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Heading2 style={styles.sectionTitle}>
                Contact Information
              </Heading2>

              <View style={styles.formGroup}>
                <Label>Email *</Label>
                <TextInput
                  style={styles.input}
                  value={formData.contactInfo.email}
                  onChangeText={(value) =>
                    updateNestedFormData("contactInfo", "email", value)
                  }
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
                  onChangeText={(value) =>
                    updateNestedFormData("contactInfo", "phone", value)
                  }
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
              onPress={onSubmit}
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
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
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
  submitContainer: {
    paddingTop: Theme.spacing.xl,
  },
  submitButton: {
    width: "100%",
  },
});
