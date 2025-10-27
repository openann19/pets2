import { logger } from "@pawfectmatch/core";

// Local option definitions
interface Option {
  value: string;
  label: string;
}

const SPECIES_OPTIONS: Option[] = [
  { value: "dog", label: "🐕 Dog" },
  { value: "cat", label: "🐱 Cat" },
  { value: "bird", label: "🐦 Bird" },
  { value: "rabbit", label: "🐰 Rabbit" },
  { value: "other", label: "🐾 Other" },
];

const SIZE_OPTIONS: Option[] = [
  { value: "tiny", label: "Tiny (0-10 lbs)" },
  { value: "small", label: "Small (10-25 lbs)" },
  { value: "medium", label: "Medium (25-55 lbs)" },
  { value: "large", label: "Large (55-85 lbs)" },
  { value: "extra-large", label: "Extra Large (85+ lbs)" },
];

const INTENT_OPTIONS: Option[] = [
  { value: "adoption", label: "Adoption" },
  { value: "mating", label: "Mating" },
  { value: "playdate", label: "Playdate" },
  { value: "all", label: "Open to All" },
];

const PERSONALITY_TAGS: string[] = [
  "friendly",
  "energetic",
  "playful",
  "calm",
  "shy",
  "protective",
  "good-with-kids",
  "good-with-pets",
  "trained",
  "house-trained",
];
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '../theme/Provider';
import { Theme } from '../theme/unified-theme';

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type PetProfileSetupScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "PetProfileSetup"
>;

interface PetFormData {
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
  };
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const PetProfileSetupScreen = ({
  navigation,
  route,
}: PetProfileSetupScreenProps) => {
  const { userIntent } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    intent: userIntent === "list" ? "adoption" : "all",
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
  });

  const { width: screenWidth } = useWindowDimensions();
  const progressValue = useSharedValue(0);
  const slideValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = withTiming((currentStep + 1) / 4, { duration: 300 });
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value * screenWidth,
    };
  });

  const updateFormData = (
    field: string,
    value: import("../../types/forms").FormFieldValue,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateHealthInfo = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [field]: value,
      },
    }));
  };

  const togglePersonalityTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.name.trim() && formData.species && formData.breed.trim()
        );
      case 1:
        return formData.age && formData.gender && formData.size;
      case 2:
        return formData.intent && formData.personalityTags.length > 0;
      case 3:
        return true; // Health info is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields to continue.",
      );
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    try {
      // Here you would save the pet profile to your backend
      logger.info("Creating pet profile:", { formData });

      // Navigate to preferences setup or welcome screen
      navigation.navigate("PreferencesSetup", { userIntent });
    } catch (error) {
      Alert.alert("Error", "Failed to create pet profile. Please try again.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderPhysicalInfoStep();
      case 2:
        return renderPersonalityStep();
      case 3:
        return renderHealthInfoStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your pet</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => {
            updateFormData("name", text);
          }}
          placeholder="e.g., Buddy, Luna, Max"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species *</Text>
        <View style={styles.optionsGrid}>
          {SPECIES_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.species === option.value && styles.selectedOption,
              ])}
               testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                updateFormData("species", option.value);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.species === option.value &&
                    styles.selectedOptionText,
                ])}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={formData.breed}
          onChangeText={(text) => {
            updateFormData("breed", text);
          }}
          placeholder="e.g., Golden Retriever, Persian Cat"
        />
      </View>
    </View>
  );

  const renderPhysicalInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Details</Text>
      <Text style={styles.stepSubtitle}>
        Help others find the perfect match
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age (years) *</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => {
            updateFormData("age", text);
          }}
          placeholder="e.g., 2"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionsRow}>
          {["male", "female"].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.gender === gender && styles.selectedOption,
              ])}
               testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                updateFormData("gender", gender);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.gender === gender && styles.selectedOptionText,
                ])}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Size *</Text>
        <View style={styles.optionsGrid}>
          {SIZE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.size === option.value && styles.selectedOption,
              ])}
               testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                updateFormData("size", option.value);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.size === option.value && styles.selectedOptionText,
                ])}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPersonalityStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personality & Intent</Text>
      <Text style={styles.stepSubtitle}>What makes your pet special?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>What are you looking for? *</Text>
        <View style={styles.optionsGrid}>
          {INTENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.intent === option.value && styles.selectedOption,
              ])}
               testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                updateFormData("intent", option.value);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.intent === option.value && styles.selectedOptionText,
                ])}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Personality Tags * (Select at least one)
        </Text>
        <View style={styles.tagsContainer}>
          {PERSONALITY_TAGS.slice(0, 12).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={StyleSheet.flatten([
                styles.tagButton,
                formData.personalityTags.includes(tag) && styles.selectedTag,
              ])}
               testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                togglePersonalityTag(tag);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.tagText,
                  formData.personalityTags.includes(tag) &&
                    styles.selectedTagText,
                ])}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={StyleSheet.flatten([styles.input, styles.textArea])}
          value={formData.description}
          onChangeText={(text) => {
            updateFormData("description", text);
          }}
          placeholder="Tell us more about your pet's personality, habits, or special needs..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderHealthInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Health Information</Text>
      <Text style={styles.stepSubtitle}>
        Help potential matches know your pet's health status
      </Text>

      <View style={styles.healthOptions}>
        {[
          { key: "vaccinated", label: "Vaccinated", icon: "💉" },
          { key: "spayedNeutered", label: "Spayed/Neutered", icon: "🏥" },
          { key: "microchipped", label: "Microchipped", icon: "🔍" },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={StyleSheet.flatten([
              styles.healthOption,
              formData.healthInfo[
                option.key as keyof typeof formData.healthInfo
              ] && styles.selectedHealthOption,
            ])}
             testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
              updateHealthInfo(
                option.key,
                !formData.healthInfo[
                  option.key as keyof typeof formData.healthInfo
                ],
              );
            }}
          >
            <Text style={styles.healthIcon}>{option.icon}</Text>
            <Text
              style={StyleSheet.flatten([
                styles.healthLabel,
                formData.healthInfo[
                  option.key as keyof typeof formData.healthInfo
                ] && styles.selectedHealthLabel,
              ])}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.healthNote}>
        💡 Providing health information helps build trust with potential
        adopters and ensures better matches.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, progressStyle]}
              />
            </View>
            <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton}  testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.nextButton,
              !validateStep() && styles.disabledButton,
            ])}
             testID="PetProfileSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleNext}
            disabled={!validateStep()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? "Complete" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 2,
    maxWidth: "100%",
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.neutral[800],
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.neutral[500],
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.bg.secondary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.neutral[800],
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    backgroundColor: theme.colors.bg.secondary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#fdf2f8",
    borderColor: theme.colors.primary[500],
  },
  optionText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#ec4899",
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedTag: {
    backgroundColor: "#ec4899",
  },
  tagText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  selectedTagText: {
    color: "#ffffff",
  },
  healthOptions: {
    gap: 16,
    marginBottom: 24,
  },
  healthOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
  },
  selectedHealthOption: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  healthIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  healthLabel: {
    fontSize: 16,
    color: theme.colors.neutral[500],
    fontWeight: "500",
  },
  selectedHealthLabel: {
    color: "#10b981",
    fontWeight: "600",
  },
  healthNote: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  backButtonText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default PetProfileSetupScreen;
