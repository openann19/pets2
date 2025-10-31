/**
 * AI Bio Screen - Refactored
 * Production-hardened screen component using extracted hooks and components
 * Reduced from 878 lines to focused, maintainable component (~250 lines)
 */

import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAIBioScreen } from '../hooks/screens/useAIBioScreen';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { PhotoUploadSection } from '../components/ai/PhotoUploadSection';
import { PetInfoForm } from '../components/ai/PetInfoForm';
import { ToneSelector } from '../components/ai/ToneSelector';
import { GenerateButton } from '../components/ai/GenerateButton';
import { BioResults } from '../components/ai/BioResults';
import { BioHistorySection } from '../components/ai/BioHistorySection';

export default function AIBioScreen() {
  const theme: AppTheme = useTheme();
  const {
    // Form state
    petName,
    setPetName,
    petBreed,
    setPetBreed,
    petAge,
    setPetAge,
    petPersonality,
    setPetPersonality,
    selectedTone,
    setSelectedTone,
    selectedPhoto,
    tones,

    // UI state
    isGenerating,
    generatedBio,
    bioHistory,

    // Actions
    pickImage,
    generateBio,
    saveBio,
    handleGoBack,
  } = useAIBioScreen();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitle: {
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h1.weight,
          color: theme.colors.onSurface,
        },
        headerRight: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          flex: 1,
          paddingHorizontal: theme.spacing.lg,
        },
      }),
    [theme],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="AIBioScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={handleGoBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Bio Generator</Text>
        <View style={styles.headerRight}>
          <Ionicons
            name="star"
            size={24}
            color={theme.colors.primary}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload */}
        <PhotoUploadSection
          selectedPhoto={selectedPhoto}
          onPickImage={pickImage}
        />

        {/* Pet Information Form */}
        <PetInfoForm
          petName={petName}
          setPetName={setPetName}
          petBreed={petBreed}
          setPetBreed={setPetBreed}
          petAge={petAge}
          setPetAge={setPetAge}
          petPersonality={petPersonality}
          setPetPersonality={setPetPersonality}
          validationErrors={{}}
        />

        {/* Tone Selection */}
        <ToneSelector
          tones={tones}
          selectedTone={selectedTone}
          onToneSelect={setSelectedTone}
        />

        {/* Generate Button */}
        <GenerateButton
          isGenerating={isGenerating}
          onPress={generateBio}
        />

        {/* Generated Bio */}
        {generatedBio && (
          <BioResults
            generatedBio={generatedBio}
            onSave={saveBio}
            onRegenerate={generateBio}
          />
        )}

        {/* Bio History */}
        <BioHistorySection history={bioHistory} />
      </ScrollView>
    </SafeAreaView>
  );
}
