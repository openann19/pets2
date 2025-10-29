import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request } from '../../services/api';

// Runtime theme has radius (not radii) and bgAlt/surfaceAlt in colors
type RuntimeTheme = AppTheme & {
  radius: {
    'xs': number;
    'sm': number;
    'md': number;
    'lg': number;
    'xl': number;
    '2xl': number;
    'full': number;
    'pill': number;
    'none': number;
  };
  colors: AppTheme['colors'] & { bgAlt?: string; surfaceAlt?: string };
};

type AdoptionStackParamList = {
  CreateListing: undefined;
};

type CreateListingScreenProps = NativeStackScreenProps<AdoptionStackParamList, 'CreateListing'>;

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
  const theme = useTheme();
  const themeRuntime = theme as RuntimeTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [formData, setFormData] = useState<PetFormData>({
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

  const personalityOptions = [
    'Friendly',
    'Playful',
    'Calm',
    'Energetic',
    'Shy',
    'Confident',
    'Good with kids',
    'Good with other pets',
    'Independent',
    'Affectionate',
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
      Alert.alert('Missing Information', 'Please fill in all required fields.');
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

      await request('/api/adoption/listings', {
        method: 'POST',
        body: listingData,
      });

      Alert.alert('Success!', 'Your pet listing has been created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      logger.error('Failed to create listing:', { error });
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPhoto = () => {
    Alert.alert('Add Photo', 'Photo upload feature coming soon!');
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
            testID="CreateListingScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Pet Listing</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              testID="CreateListingScreen-button-1"
              accessibilityLabel="Button"
              accessibilityRole="button"
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos *</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <TouchableOpacity
              style={styles.photoUpload}
              testID="CreateListingScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={addPhoto}
            >
              <LinearGradient
                colors={[themeRuntime.colors.bgAlt ?? theme.colors.surface, theme.colors.surface]}
                style={styles.photoUploadGradient}
              >
                <Ionicons
                  name="camera"
                  size={32}
                  color={theme.colors.onMuted}
                />
                <Text style={styles.photoUploadText}>Add Photos</Text>
                <Text style={styles.photoUploadHint}>Tap to upload pet photos</Text>
              </LinearGradient>
            </TouchableOpacity>
            {formData.photos.length > 0 && (
              <View style={styles.photoPreview}>
                <Text style={styles.photoCount}>
                  {formData.photos.length} photo
                  {formData.photos.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
            )}
          </BlurView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pet Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => {
                  handleInputChange('name', value);
                }}
                placeholder="Enter pet's name"
                placeholderTextColor={theme.colors.onMuted}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Species *</Text>
                <View style={styles.radioGroup}>
                  {['dog', 'cat'].map((species) => (
                    <TouchableOpacity
                      key={species}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.species === species && styles.radioButtonActive,
                      ])}
                      testID="CreateListingScreen-button-2"
                      accessibilityLabel="Interactive element"
                      accessibilityRole="button"
                      onPress={() => {
                        handleInputChange('species', species);
                      }}
                    >
                      <Text
                        style={StyleSheet.flatten([
                          styles.radioText,
                          formData.species === species && styles.radioTextActive,
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
                  {['male', 'female'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.gender === gender && styles.radioButtonActive,
                      ])}
                      testID="CreateListingScreen-button-2"
                      accessibilityLabel="Interactive element"
                      accessibilityRole="button"
                      onPress={() => {
                        handleInputChange('gender', gender);
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
                  handleInputChange('breed', value);
                }}
                placeholder="Enter breed"
                placeholderTextColor={theme.colors.onMuted}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.age}
                  onChangeText={(value) => {
                    handleInputChange('age', value);
                  }}
                  placeholder="e.g., 2 years"
                  placeholderTextColor={theme.colors.onMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Size</Text>
                <View style={styles.radioGroup}>
                  {['small', 'medium', 'large'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={StyleSheet.flatten([
                        styles.radioButton,
                        formData.size === size && styles.radioButtonActive,
                      ])}
                      testID="CreateListingScreen-button-2"
                      accessibilityLabel="Interactive element"
                      accessibilityRole="button"
                      onPress={() => {
                        handleInputChange('size', size);
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
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <TextInput
              style={StyleSheet.flatten([styles.textInput, styles.textArea])}
              value={formData.description}
              onChangeText={(value) => {
                handleInputChange('description', value);
              }}
              placeholder="Tell potential adopters about your pet's personality, habits, and what makes them special..."
              placeholderTextColor={theme.colors.onMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </BlurView>
        </View>

        {/* Personality Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionSubtitle}>Select traits that describe your pet</Text>
            <View style={styles.tagsContainer}>
              {personalityOptions.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={StyleSheet.flatten([
                    styles.tag,
                    formData.personalityTags.includes(tag) && styles.tagActive,
                  ])}
                  testID="CreateListingScreen-button-2"
                  accessibilityLabel="Interactive element"
                  accessibilityRole="button"
                  onPress={() => {
                    handlePersonalityToggle(tag);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.tagText,
                      formData.personalityTags.includes(tag) && styles.tagTextActive,
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
          <BlurView
            intensity={20}
            style={styles.sectionCard}
          >
            <View style={styles.healthGrid}>
              {Object.entries(formData.healthInfo).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.healthItem}
                  testID="CreateListingScreen-button-2"
                  accessibilityLabel="Interactive element"
                  accessibilityRole="button"
                  onPress={() => {
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
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={theme.colors.onSurface}
                      />
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
            testID="CreateListingScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={
                isSubmitting
                  ? [theme.colors.onMuted, theme.colors.onMuted]
                  : ((theme as any).palette?.gradients?.primary ?? [
                      theme.colors.primary,
                      theme.colors.primary,
                    ])
              }
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <>
                  <Ionicons
                    name="hourglass"
                    size={20}
                    color={theme.colors.onSurface}
                  />
                  <Text style={styles.submitText}>Creating Listing...</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="paw"
                    size={20}
                    color={theme.colors.onSurface}
                  />
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

function makeStyles(theme: AppTheme) {
  // Type assertion for runtime theme structure (radius exists at runtime, but types mismatch)
  const themeRuntime = theme as RuntimeTheme;

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    headerActions: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.xs,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.md,
    },
    sectionCard: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
      padding: theme.spacing.md,
    },
    formGroup: {
      marginBottom: theme.spacing.md,
    },
    formRow: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: themeRuntime.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top' as const,
    },
    radioGroup: {
      flexDirection: 'row' as const,
      gap: theme.spacing.xs,
    },
    radioButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      borderRadius: themeRuntime.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center' as const,
    },
    radioButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    radioText: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: theme.colors.onMuted,
    },
    radioTextActive: {
      color: theme.colors.onSurface,
    },
    photoUpload: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
    },
    photoUploadGradient: {
      padding: theme.spacing['2xl'],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    photoUploadText: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.sm,
    },
    photoUploadHint: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.xs,
    },
    photoPreview: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: themeRuntime.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    photoCount: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500' as const,
    },
    tagsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: theme.spacing.xs,
    },
    tag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      borderRadius: themeRuntime.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tagText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: '500' as const,
    },
    tagTextActive: {
      color: theme.colors.onSurface,
    },
    healthGrid: {
      gap: theme.spacing.sm,
    },
    healthItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.sm,
    },
    healthCheckbox: {
      width: 24,
      height: 24,
      borderRadius: themeRuntime.radius.xs,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    healthCheckboxActive: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    healthText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500' as const,
    },
    submitButton: {
      borderRadius: themeRuntime.radius.md,
      overflow: 'hidden' as const,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitGradient: {
      padding: theme.spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: theme.spacing.xs,
    },
    submitText: {
      color: theme.colors.onSurface,
      fontSize: 18,
      fontWeight: 'bold' as const,
    },
  };
}

export default CreateListingScreen;
