import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local option definitions
interface Option {
  value: string;
  label: string;
}

const SPECIES_OPTIONS: Option[] = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'other', label: '🐾 Other' },
];

const SIZE_OPTIONS: Option[] = [
  { value: 'tiny', label: 'Tiny (0-10 lbs)' },
  { value: 'small', label: 'Small (10-25 lbs)' },
  { value: 'medium', label: 'Medium (25-55 lbs)' },
  { value: 'large', label: 'Large (55-85 lbs)' },
  { value: 'extra-large', label: 'Extra Large (85+ lbs)' },
];

const INTENT_OPTIONS: Option[] = [
  { value: 'adoption', label: 'Adoption' },
  { value: 'mating', label: 'Mating' },
  { value: 'playdate', label: 'Playdate' },
  { value: 'all', label: 'Open to All' },
];

const PERSONALITY_TAGS: string[] = [
  'friendly',
  'energetic',
  'playful',
  'calm',
  'shy',
  'protective',
  'good-with-kids',
  'good-with-pets',
  'trained',
  'house-trained',
];

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type PetProfileSetupScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'PetProfileSetup'
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

const PetProfileSetupScreen = ({ navigation, route }: PetProfileSetupScreenProps) => {
  const { userIntent } = route.params;
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    intent: userIntent === 'list' ? 'adoption' : 'all',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
  });

  const { width: screenWidth } = useWindowDimensions();
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = withTiming((currentStep + 1) / 4, { duration: 300 });
  }, [currentStep]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progressValue.value * screenWidth,
    };
  });

  const updateFormData = (field: string, value: import('../../types/forms').FormFieldValue) => {
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
        return formData.name.trim() && formData.species && formData.breed.trim();
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
      Alert.alert('Missing Information', 'Please fill in all required fields to continue.');
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
      logger.info('Creating pet profile:', { formData });

      // Navigate to preferences setup or welcome screen
      navigation.navigate('PreferencesSetup', { userIntent });
    } catch (error) {
      Alert.alert('Error', 'Failed to create pet profile. Please try again.');
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
            updateFormData('name', text);
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
              testID="PetProfileSetupScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                updateFormData('species', option.value);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.species === option.value && styles.selectedOptionText,
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
            updateFormData('breed', text);
          }}
          placeholder="e.g., Golden Retriever, Persian Cat"
        />
      </View>
    </View>
  );

  const renderPhysicalInfoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Physical Details</Text>
      <Text style={styles.stepSubtitle}>Help others find the perfect match</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age (years) *</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => {
            updateFormData('age', text);
          }}
          placeholder="e.g., 2"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.optionsRow}>
          {['male', 'female'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.gender === gender && styles.selectedOption,
              ])}
              testID="PetProfileSetupScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                updateFormData('gender', gender);
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
              testID="PetProfileSetupScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                updateFormData('size', option.value);
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
              testID="PetProfileSetupScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                updateFormData('intent', option.value);
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
        <Text style={styles.label}>Personality Tags * (Select at least one)</Text>
        <View style={styles.tagsContainer}>
          {PERSONALITY_TAGS.slice(0, 12).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={StyleSheet.flatten([
                styles.tagButton,
                formData.personalityTags.includes(tag) && styles.selectedTag,
              ])}
              testID="PetProfileSetupScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                togglePersonalityTag(tag);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.tagText,
                  formData.personalityTags.includes(tag) && styles.selectedTagText,
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
            updateFormData('description', text);
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
      <Text style={styles.stepSubtitle}>Help potential matches know your pet's health status</Text>

      <View style={styles.healthOptions}>
        {[
          { key: 'vaccinated', label: 'Vaccinated', icon: '💉' },
          { key: 'spayedNeutered', label: 'Spayed/Neutered', icon: '🏥' },
          { key: 'microchipped', label: 'Microchipped', icon: '🔍' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={StyleSheet.flatten([
              styles.healthOption,
              formData.healthInfo[option.key as keyof typeof formData.healthInfo] &&
                styles.selectedHealthOption,
            ])}
            testID="PetProfileSetupScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              updateHealthInfo(
                option.key,
                !formData.healthInfo[option.key as keyof typeof formData.healthInfo],
              );
            }}
          >
            <Text style={styles.healthIcon}>{option.icon}</Text>
            <Text
              style={StyleSheet.flatten([
                styles.healthLabel,
                formData.healthInfo[option.key as keyof typeof formData.healthInfo] &&
                  styles.selectedHealthLabel,
              ])}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.healthNote}>
        💡 Providing health information helps build trust with potential adopters and ensures better
        matches.
      </Text>
    </View>
  );

  const styles = useMemo(
    () => {
      // Helper for rgba with opacity
      const alpha = (color: string, opacity: number) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      return StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        keyboardView: {
          flex: 1,
        },
        header: {
          padding: theme.spacing.lg + theme.spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        progressContainer: {
          alignItems: 'center',
        },
        progressBar: {
          width: '100%',
          height: 4,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xs,
          marginBottom: theme.spacing.sm,
        },
        progressFill: {
          height: '100%',
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.xs,
          maxWidth: '100%',
        },
        progressText: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onMuted,
          fontWeight: theme.typography.medium,
        },
        content: {
          flex: 1,
          padding: theme.spacing.lg + theme.spacing.xs,
        },
        stepContainer: {
          flex: 1,
        },
        stepTitle: {
          fontSize: theme.typography.h2.size * 1.2,
          fontWeight: theme.typography.h1.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        stepSubtitle: {
          fontSize: theme.typography.body.size,
          color: theme.colors.onMuted,
          marginBottom: theme.spacing.lg + theme.spacing.xs,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.sm,
          padding: theme.spacing.lg,
          fontSize: theme.typography.body.size,
          backgroundColor: theme.colors.surface,
          marginBottom: theme.spacing.lg,
          color: theme.colors.onSurface,
        },
        inputError: {
          borderColor: theme.colors.danger,
        },
        inputFocused: {
          borderColor: theme.colors.primary,
        },
        errorText: {
          color: theme.colors.danger,
          fontSize: theme.typography.body.size * 0.875,
          marginTop: theme.spacing.xs,
        },
        optionsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg + theme.spacing.xs,
        },
        optionButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          minWidth: 80,
          alignItems: 'center',
        },
        optionButtonSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: alpha(theme.colors.primary, 0.1),
        },
        optionText: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onMuted,
        },
        optionTextSelected: {
          color: theme.colors.primary,
          fontWeight: theme.typography.h2.weight,
        },
        tagsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg + theme.spacing.xs,
        },
        tagButton: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        tagButtonSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: alpha(theme.colors.primary, 0.1),
        },
        tagText: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onMuted,
        },
        tagTextSelected: {
          color: theme.colors.primary,
          fontWeight: theme.typography.medium,
        },
        navigation: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.lg + theme.spacing.xs,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        navButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
          borderRadius: theme.radii.sm,
          minWidth: 100,
          alignItems: 'center',
        },
        navButtonPrimary: {
          backgroundColor: theme.colors.primary,
        },
        navButtonSecondary: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        navButtonDisabled: {
          backgroundColor: theme.colors.surface,
          opacity: 0.6,
        },
        navButtonText: {
          fontSize: theme.typography.body.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onPrimary,
        },
        navButtonTextSecondary: {
          color: theme.colors.onSurface,
        },
        navButtonTextDisabled: {
          color: theme.colors.onMuted,
        },
        inputGroup: {
          marginBottom: theme.spacing.lg,
        },
        label: {
          fontSize: theme.typography.body.size * 0.875,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        selectedOption: {
          borderColor: theme.colors.primary,
          backgroundColor: alpha(theme.colors.primary, 0.1),
        },
        selectedOptionText: {
          color: theme.colors.primary,
          fontWeight: theme.typography.h2.weight,
        },
        optionsRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        selectedTag: {
          borderColor: theme.colors.primary,
          backgroundColor: alpha(theme.colors.primary, 0.1),
        },
        selectedTagText: {
          color: theme.colors.primary,
          fontWeight: theme.typography.h2.weight,
        },
        textArea: {
          minHeight: 100,
          textAlignVertical: 'top',
        },
        healthOptions: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        healthOption: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        selectedHealthOption: {
          borderColor: theme.colors.primary,
          backgroundColor: alpha(theme.colors.primary, 0.1),
        },
        healthIcon: {
          fontSize: theme.typography.body.size,
          marginEnd: theme.spacing.xs,
        },
        healthLabel: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onMuted,
        },
        selectedHealthLabel: {
          color: theme.colors.primary,
          fontWeight: theme.typography.h2.weight,
        },
        healthNote: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onMuted,
          lineHeight: theme.typography.body.lineHeight * 1.25,
          marginTop: theme.spacing.md,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.lg + theme.spacing.xs,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        backButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
          borderRadius: theme.radii.sm,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          minWidth: 100,
          alignItems: 'center',
        },
        backButtonText: {
          fontSize: theme.typography.body.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
        },
        nextButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
          borderRadius: theme.radii.sm,
          backgroundColor: theme.colors.primary,
          minWidth: 100,
          alignItems: 'center',
        },
        disabledButton: {
          backgroundColor: theme.colors.surface,
          opacity: 0.6,
        },
        nextButtonText: {
          fontSize: theme.typography.body.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onPrimary,
        },
      });
    },
    [theme],
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            testID="PetProfileSetupScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.nextButton,
              !validateStep() && styles.disabledButton,
            ])}
            testID="PetProfileSetupScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleNext}
            disabled={!validateStep()}
          >
            <Text style={styles.nextButtonText}>{currentStep === 3 ? 'Complete' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PetProfileSetupScreen;
