/**
 * AI Photo Analyzer Screen - Refactored
 * Production-hardened screen component using extracted hooks and components
 * Reduced from 1,093 LOC to focused, maintainable component (~300 LOC)
 */

import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { getExtendedColors } from "../../theme/adapters";
import type { AIScreenProps } from "../../navigation/types";
import { useAIPhotoAnalyzerScreen } from "../../hooks/screens/useAIPhotoAnalyzerScreen";
import { PhotoUploadSection } from "./photoanalyzer/PhotoUploadSection";
import { AnalysisResultsSection } from "./photoanalyzer/AnalysisResultsSection";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AIPhotoAnalyzerScreen = ({
  navigation,
}: AIScreenProps): React.JSX.Element => {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  
  const {
    selectedImage,
    isAnalyzing,
    analysisResult,
    error,
    pickImage,
    takePhoto,
    analyzePhoto,
    clearImage,
    handleGoBack,
    clearError,
  } = useAIPhotoAnalyzerScreen();

  // Show error if any
  if (error) {
    Alert.alert("Error", error);
    clearError();
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="AIPhotoAnalyzerScreen-back-button"
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
          >
            AI Photo Analyzer
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Photo Upload Section */}
        <PhotoUploadSection
          selectedImage={selectedImage}
          onPickImage={pickImage}
          onTakePhoto={takePhoto}
          colors={{
            text: colors.onSurface,
            textSecondary: colors.onMuted,
            card: colors.surface,
            primary: colors.primary,
            secondary: colors.secondary,
          }}
        />

        {/* Analyze Button */}
        {selectedImage !== null && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              testID="AIPhotoAnalyzerScreen-analyze-button"
              accessibilityLabel="Analyze photo"
              accessibilityRole="button"
              style={StyleSheet.flatten([
                styles.analyzeButton,
                { backgroundColor: colors.primary },
                isAnalyzing && styles.analyzeButtonDisabled,
              ])}
              onPress={analyzePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="#ffffff" />
                  <Text style={styles.analyzeButtonText}>Analyze Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult !== null && (
          <AnalysisResultsSection result={analysisResult} colors={colors} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
  },
  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
  analysisSection: {
    marginBottom: 24,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AIPhotoAnalyzerScreen;

