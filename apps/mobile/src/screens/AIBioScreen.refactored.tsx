/**
 * AI Bio Screen - Refactored
 * Production-hardened screen component using extracted hooks and components
 * Reduced from 17,000+ lines to focused, maintainable component
 */

import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";

import { useAIBio } from "../hooks/useAIBio";
import { PetInfoForm } from "../components/ai/PetInfoForm";
import { ToneSelector } from "../components/ai/ToneSelector";
import { BioResults } from "../components/ai/BioResults";
import { useTheme } from "@mobile/src/theme";
import { getExtendedColors } from "../theme/adapters";

interface AIBioScreenProps {
  navigation: NavigationProp<any>;
}

export default function AIBioScreen({ navigation }: AIBioScreenProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
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

    // Generation state
    isGenerating,
    generatedBio,
    bioHistory,

    // Actions
    generateBio,
    pickImage,
    saveBio,
    clearForm,
    resetGeneration,

    // Validation
    isFormValid,
    validationErrors,
  } = useAIBio();

  const handleGenerate = async () => {
    try {
      await generateBio();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          testID="AIBioScreen-back-button"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.onSurface
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Pet Bio</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!generatedBio ? (
          /* Input Form */
          <View style={styles.formContainer}>
            <PetInfoForm
              petName={petName}
              setPetName={setPetName}
              petBreed={petBreed}
              setPetBreed={setPetBreed}
              petAge={petAge}
              setPetAge={setPetAge}
              petPersonality={petPersonality}
              setPetPersonality={setPetPersonality}
              validationErrors={validationErrors}
            />

            <ToneSelector
              selectedTone={selectedTone}
              onToneSelect={setSelectedTone}
            />

            {/* Photo Picker */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Pet Photo (Optional)</Text>
              <TouchableOpacity
                style={styles.photoPicker}
                testID="AIBioScreen-photo-picker"
                accessibilityRole="button"
                accessibilityLabel="Select pet photo"
                onPress={pickImage}
              >
                {selectedPhoto ? (
                  <View style={styles.photoPreview}>
                    <Text style={styles.photoText}>Photo Selected</Text>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons
                      name="camera"
                      size={32}
                      color={colors.onMuted}
                    />
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.generateButton,
                (!isFormValid || isGenerating) && styles.disabledButton,
              ])}
              testID="AIBioScreen-generate-button"
              accessibilityRole="button"
              accessibilityLabel="Generate AI bio"
              disabled={!isFormValid || isGenerating}
              onPress={handleGenerate}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? "Generating..." : "Generate Bio"}
              </Text>
            </TouchableOpacity>

            {validationErrors.submit && (
              <Text style={styles.submitError}>{validationErrors.submit}</Text>
            )}
          </View>
        ) : (
          /* Results View */
          <View style={styles.resultsContainer}>
            <BioResults
              generatedBio={generatedBio}
              onSave={saveBio}
              onRegenerate={resetGeneration}
            />

            {/* History Summary */}
            {bioHistory.length > 1 && (
              <View style={styles.historySummary}>
                <Text style={styles.historyText}>
                  {bioHistory.length} bio{bioHistory.length !== 1 ? "s" : ""}{" "}
                  generated
                </Text>
              </View>
            )}

            {/* New Bio Button */}
            <TouchableOpacity
              style={styles.newBioButton}
              testID="AIBioScreen-new-bio-button"
              accessibilityRole="button"
              accessibilityLabel="Create new bio"
              onPress={() => {
                resetGeneration();
                clearForm();
              }}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.newBioText}>Create New Bio</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof getExtendedColors>, spacing: any, borderRadius: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  photoSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  photoPicker: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  photoPlaceholder: {
    alignItems: "center",
  },
  photoPreview: {
    alignItems: "center",
  },
  photoText: {
    fontSize: 16,
    color: colors.onMuted,
    marginTop: spacing.sm,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.onMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  submitError: {
    fontSize: 14,
    color: colors.danger,
    textAlign: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  resultsContainer: {
    flex: 1,
  },
  historySummary: {
    padding: spacing.lg,
    alignItems: "center",
  },
  historyText: {
    fontSize: 14,
    color: colors.onMuted,
  },
  newBioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  newBioText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

// Call the function to create styles
const styles = createStyles(
  { background: '#fff', border: '#ccc', text: '#000', textMuted: '#666', primary: '#007AFF', white: '#fff', danger: '#FF3B30' } as any,
  { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as any,
  { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, full: 9999 } as any
);
