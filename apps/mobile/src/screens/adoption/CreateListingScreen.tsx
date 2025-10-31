/**
 * Create Listing Screen
 * Refactored: Uses extracted components and hooks
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import {
  BasicInfoSection,
  CreateListingHeader,
  DescriptionSection,
  HealthInfoSection,
  PersonalityTagsSection,
  PhotoUploadSection,
  SubmitButton,
} from './create-listing/components';
import { useCreateListing } from './create-listing/hooks';

type AdoptionStackParamList = {
  CreateListing: undefined;
};

type CreateListingScreenProps = NativeStackScreenProps<AdoptionStackParamList, 'CreateListing'>;

const CreateListingScreen = ({ navigation }: CreateListingScreenProps) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const {
    formData,
    isSubmitting,
    isUploadingPhoto,
    handleInputChange,
    handleHealthToggle,
    handlePersonalityToggle,
    addPhoto,
    handleSubmit,
    canSubmit,
  } = useCreateListing({
    onSuccess: () => navigation.goBack(),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <CreateListingHeader onBack={() => navigation.goBack()} />
        <PhotoUploadSection
          photos={formData.photos}
          isUploading={isUploadingPhoto}
          onAddPhoto={addPhoto}
        />
        <BasicInfoSection formData={formData} onInputChange={handleInputChange} />
        <DescriptionSection
          description={formData.description}
          onDescriptionChange={(value) => handleInputChange('description', value)}
        />
        <PersonalityTagsSection
          personalityTags={[]}
          selectedTags={formData.personalityTags}
          onToggleTag={handlePersonalityToggle}
        />
        <HealthInfoSection
          healthInfo={formData.healthInfo}
          onToggleHealth={(field) => handleHealthToggle(field as keyof typeof formData.healthInfo)}
        />
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={!canSubmit}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
  });
}

export default CreateListingScreen;
