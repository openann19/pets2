import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { request } from "../../services/api";
import { useTheme } from '../theme/Provider';
import { Theme } from '../theme/unified-theme';

type AdoptionStackParamList = {
  CreateListing: undefined;
};

type CreateListingScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  "CreateListing"
>;

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  photos: string[];
}

const CreateListingScreen = ({ navigation }: CreateListingScreenProps) => {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const personalityOptions = [
    "Friendly",
    "Playful",
    "Calm",
    "Energetic",
    "Shy",
    "Confident",
    "Good with kids",
    "Good with other pets",
    "Independent",
    "Affectionate",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHealthToggle = (field: keyof typeof formData.healthInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [field]: !prev.healthInfo[field],
      },
    }));
  };

  const handlePersonalityToggle = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.breed || !formData.description) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create listing via API
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

      await request("/api/adoption/listings", {
        method: "POST",
        body: listingData,
      });

      Alert.alert(
        "Success!",
        "Your pet listing has been created successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      logger.error("Failed to create listing:", { error });
      Alert.alert("Error", "Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPhoto = () => {
    Alert.alert("Add Photo", "Photo upload feature coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
             testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Pet Listing</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} testID="CreateListingScreen-button-1" accessibilityLabel="Button" accessibilityRole="button">
              <Ionicons name="help-circle-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos *</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <TouchableOpacity style={styles.photoUpload}  testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={addPhoto}>
              <LinearGradient
                colors={[theme.colors.neutral[100], theme.colors.neutral[200]}
                style={styles.photoUploadGradient}
              >
                <Ionicons name="camera" size={32} color={theme.colors.neutral[500]} }/>
                <Text style={styles.photoUploadText}>Add Photos</Text>
                <Text style={styles.photoUploadHint}>
                  Tap to upload pet photos
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {formData.photos.length > 0 && (
              <View style={styles.photoPreview}>
                <Text style={styles.photoCount}>
                  {formData.photos.length} photo
                  {formData.photos.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pet Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => {
                  handleInputChange("name", value);
                }}
                placeholder="Enter pet's name"
                placeholderTextColor=theme.colors.neutral[400]
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Species *</Text>
                <View style={styles.radioGroup}>
                  {["dog", "cat"].map((species) => (
                    <TouchableOpacity
                      key={species}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.species === species &&
                          styles.radioButtonActive,
                      ])}
                       testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                        handleInputChange("species", species);
                      }}
                    >
                      <Text
                        style={StyleSheet.flatten([
                          styles.radioText,
                          formData.species === species &&
                            styles.radioTextActive,
                        ])}
                      >
                        {species.charAt(0).toUpperCase() + species.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.radioGroup}>
                  {["male", "female"].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.gender === gender && styles.radioButtonActive,
                      ])}
                       testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                        handleInputChange("gender", gender);
                      }}
                    >
                      <Text
                        style={StyleSheet.flatten([
                          styles.radioText,
                          formData.gender === gender && styles.radioTextActive,
                        ])}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Breed *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.breed}
                onChangeText={(value) => {
                  handleInputChange("breed", value);
                }}
                placeholder="Enter breed"
                placeholderTextColor=theme.colors.neutral[400]
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.age}
                  onChangeText={(value) => {
                    handleInputChange("age", value);
                  }}
                  placeholder="e.g., 2 years"
                  placeholderTextColor=theme.colors.neutral[400]
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Size</Text>
                <View style={styles.radioGroup}>
                  {["small", "medium", "large"].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.size === size && styles.radioButtonActive,
                      ])}
                       testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                        handleInputChange("size", size);
                      }}
                    >
                      <Text
                        style={StyleSheet.flatten([
                          styles.radioText,
                          formData.size === size && styles.radioTextActive,
                        ])}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <TextInput
              style={StyleSheet.flatten([styles.textInput, styles.textArea])}
              value={formData.description}
              onChangeText={(value) => {
                handleInputChange("description", value);
              }}
              placeholder="Tell potential adopters about your pet's personality, habits, and what makes them special..."
              placeholderTextColor=theme.colors.neutral[400]
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </BlurView>
        </View>

        {/* Personality Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <Text style={styles.sectionSubtitle}>
              Select traits that describe your pet
            </Text>
            <View style={styles.tagsContainer}>
              {personalityOptions.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={StyleSheet.flatten([
                    styles.tag,
                    formData.personalityTags.includes(tag) && styles.tagActive,
                  ])}
                   testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    handlePersonalityToggle(tag);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.tagText,
                      formData.personalityTags.includes(tag) &&
                        styles.tagTextActive,
                    ])}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Health Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.healthGrid}>
              {Object.entries(formData.healthInfo).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.healthItem}
                   testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    handleHealthToggle(key as keyof typeof formData.healthInfo);
                  }}
                >
                  <View
                    style={StyleSheet.flatten([
                      styles.healthCheckbox,
                      value && styles.healthCheckboxActive,
                    ])}
                  >
                    {value && (
                      <Ionicons name="checkmark" size={16} color={theme.colors.neutral[0]} }/>
                    )}
                  </View>
                  <Text style={styles.healthText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ])}
             testID="CreateListingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={
                isSubmitting ? [theme.colors.neutral[400], theme.colors.neutral[500]] : [theme.colors.primary[500], theme.colors.primary[600]]
              }
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <>
                  <Ionicons name="hourglass" size={20} color={theme.colors.neutral[0]} }/>
                  <Text style={styles.submitText}>Creating Listing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="paw" size={20} color={theme.colors.neutral[0]} }/>
                  <Text style={styles.submitText}>Create Listing</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.neutral[800],
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.neutral[700],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.neutral[0],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.neutral[800],
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  radioText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.neutral[500],
  },
  radioTextActive: {
    color: theme.colors.neutral[0],
  },
  photoUpload: {
    borderRadius: 12,
    overflow: "hidden",
  },
  photoUploadGradient: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  photoUploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.neutral[700],
    marginTop: 12,
  },
  photoUploadHint: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    marginTop: 4,
  },
  photoPreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  photoCount: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  tagActive: {
    backgroundColor: "#fdf2f8",
    borderColor: theme.colors.primary[500],
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontWeight: "500",
  },
  tagTextActive: {
    color: theme.colors.primary[500],
  },
  healthGrid: {
    gap: 12,
  },
  healthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  healthCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  healthCheckboxActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  healthText: {
    fontSize: 16,
    color: theme.colors.neutral[700],
    fontWeight: "500",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: theme.colors.neutral[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: theme.colors.neutral[0],
    fontSize: 18,
    fontWeight: "bold",
  },
});
