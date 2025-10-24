/**
 * AI Bio Screen - Refactored
 * Production-hardened screen component using extracted hooks and components
 * Reduced from 17,000+ lines to focused, maintainable component
 */

import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";

import { useAIBio } from "../../hooks/useAIBio";
import { PetInfoForm } from "../../components/ai/PetInfoForm";
import { ToneSelector } from "../../components/ai/ToneSelector";
import { BioResults } from "../../components/ai/BioResults";
import { Theme } from "../../theme/unified-theme";

interface AIBioScreenProps {
  navigation: NavigationProp<any>;
}

export default function AIBioScreen({ navigation }: AIBioScreenProps) {
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
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
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
                onPress={pickImage}
                accessibilityLabel="Select pet photo"
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
                      color={Theme.colors.textMuted}
                    />
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!isFormValid || isGenerating) && styles.disabledButton,
              ]}
              onPress={handleGenerate}
              disabled={!isFormValid || isGenerating}
              accessibilityLabel="Generate AI bio"
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
              onPress={() => {
                resetGeneration();
                clearForm();
              }}
              accessibilityLabel="Create new bio"
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.newBioText}>Create New Bio</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  backButton: {
    padding: Theme.spacing.sm,
    marginRight: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.text,
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
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  photoPicker: {
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: "dashed",
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.surface,
  },
  photoPlaceholder: {
    alignItems: "center",
  },
  photoPreview: {
    alignItems: "center",
  },
  photoText: {
    fontSize: Theme.typography.sizes.base,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.sm,
  },
  generateButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    margin: Theme.spacing.lg,
    alignItems: "center",
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Theme.colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
    color: Theme.colors.surface,
  },
  submitError: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.error,
    textAlign: "center",
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  resultsContainer: {
    flex: 1,
  },
  historySummary: {
    padding: Theme.spacing.lg,
    alignItems: "center",
  },
  historyText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textMuted,
  },
  newBioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.md,
    margin: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surface,
  },
  newBioText: {
    fontSize: Theme.typography.sizes.base,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.sm,
  },
});
