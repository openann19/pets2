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

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Import new architecture components
import {
  FXContainerPresets,
  ModernPhotoUpload,
  useStaggeredAnimation,
} from '../components';
import { EliteContainer, EliteHeader } from '../components/elite';
import { useCreatePetScreen } from '../hooks/screens/useCreatePetScreen';
import { useTheme } from '@mobile/theme';
import AnimatedButton from '../components/AnimatedButton';
import type { RootStackScreenProps } from '../navigation/types';

type CreatePetScreenProps = RootStackScreenProps<'CreatePet'>;

export default function ModernCreatePetScreen({ navigation }: CreatePetScreenProps) {
  const theme = useTheme();
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
  const { start: startStaggeredAnimation } = useStaggeredAnimation(6);

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
  }, [startStaggeredAnimation]);

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing['4xl'],
    },
    section: {
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      marginBottom: theme.spacing.lg,
      color: theme.colors.onMuted,
    },
    formGroup: {
      marginBottom: theme.spacing.lg,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.onSurface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    submitContainer: {
      paddingTop: theme.spacing.xl,
    },
    submitButton: {
      width: '100%',
    },
  });

  // Submit handler
  const onSubmit = async () => {
    const result = await handleSubmit();
    if (result?.success) {
      Alert.alert('Success!', 'Your pet profile has been created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyPets'),
        },
      ]);
    }
  };

  // Species options
  const speciesOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];

  // Gender options
  const genderOptions = ['Male', 'Female', 'Unknown'];

  // Size options
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];

  // Intent options
  const intentOptions = ['Adoption', 'Foster', 'Rehoming', 'Lost & Found'];

  // Personality tags
  const personalityTagOptions = [
    'Friendly',
    'Playful',
    'Calm',
    'Energetic',
    'Shy',
    'Confident',
    'Good with kids',
    'Good with other pets',
    'House trained',
    'Leash trained',
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Upload Section */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Pet Photos</Text>
              <Text style={[styles.sectionSubtitle, { fontSize: 14, color: theme.colors.onSurface }]}>
                Add up to 6 photos to showcase your pet
              </Text>
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
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Basic Information</Text>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Pet Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => {
                    updateFormData('name', value);
                  }}
                  placeholder="Enter your pet's name"
                  placeholderTextColor={theme.colors.onMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Species *</Text>
                <View style={styles.optionsContainer}>
                  {speciesOptions.map((species) => (
                    <AnimatedButton
                      key={species}
                      variant={formData.species === species ? 'primary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        updateFormData('species', species);
                      }}
                    >
                      {species}
                    </AnimatedButton>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Breed *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={(value) => {
                    updateFormData('breed', value);
                  }}
                  placeholder="Enter breed"
                  placeholderTextColor={theme.colors.onMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Age *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(value) => {
                    updateFormData('age', value);
                  }}
                  placeholder="e.g., 2 years, 6 months"
                  placeholderTextColor={theme.colors.onMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Gender</Text>
                <View style={styles.optionsContainer}>
                  {genderOptions.map((gender) => (
                    <AnimatedButton
                      key={gender}
                      variant={formData.gender === gender ? 'primary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        updateFormData('gender', gender);
                      }}
                    >
                      {gender}
                    </AnimatedButton>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Size</Text>
                <View style={styles.optionsContainer}>
                  {sizeOptions.map((size) => (
                    <AnimatedButton
                      key={size}
                      variant={formData.size === size ? 'primary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        updateFormData('size', size);
                      }}
                    >
                      {size}
                    </AnimatedButton>
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Description */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Description</Text>
              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Tell us about your pet *</Text>
                <TextInput
                  style={StyleSheet.flatten([styles.input, styles.textArea])}
                  value={formData.description}
                  onChangeText={(value) => {
                    updateFormData('description', value);
                  }}
                  placeholder="Describe your pet's personality, habits, and what makes them special..."
                  placeholderTextColor={theme.colors.onMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Intent */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Intent</Text>
              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>What are you looking for?</Text>
                <View style={styles.optionsContainer}>
                  {intentOptions.map((intent) => (
                    <AnimatedButton
                      key={intent}
                      variant={formData.intent === intent ? 'primary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        updateFormData('intent', intent);
                      }}
                    >
                      {intent.charAt(0).toUpperCase() + intent.slice(1)}
                    </AnimatedButton>
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Personality Tags */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Personality & Traits</Text>
              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Select traits that describe your pet</Text>
                <View style={styles.optionsContainer}>
                  {personalityTagOptions.map((tag) => (
                    <AnimatedButton
                      key={tag}
                      variant={formData.personalityTags.includes(tag) ? 'primary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        togglePersonalityTag(tag);
                      }}
                    >
                      {tag}
                    </AnimatedButton>
                  ))}
                </View>
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Contact Information */}
          <View>
            <FXContainerPresets.glass style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface }]}>Contact Information</Text>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactInfo.email}
                  onChangeText={(value) => {
                    updateNestedFormData('contactInfo', 'email', value);
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.colors.onMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={{fontSize: 16, fontWeight: "500", color: theme.colors.onSurface}}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactInfo.phone}
                  onChangeText={(value) => {
                    updateNestedFormData('contactInfo', 'phone', value);
                  }}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={theme.colors.onMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </FXContainerPresets.glass>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <AnimatedButton
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onPress={onSubmit}
              style={styles.submitButton}
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Pet Profile'}
            </AnimatedButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </EliteContainer>
  );
}
