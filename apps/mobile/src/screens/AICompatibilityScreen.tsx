/**
 * AI Compatibility Analyzer Screen for Mobile
 * Advanced compatibility scoring and analysis between pets
 * Refactored to use useAICompatibilityScreen hook and section components
 */

import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@mobile/src/theme";
import type { RootStackParamList } from "../navigation/types";
import { useAICompatibilityScreen } from "../hooks/screens/useAICompatibilityScreen";
import { PetSelectionSection } from "./ai/compatibility/PetSelectionSection";
import { AnalysisResultsSection } from "./ai/compatibility/AnalysisResultsSection";

const { width: screenWidth } = Dimensions.get("window");

type AICompatibilityScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AICompatibility"
>;

const AICompatibilityScreen = ({
  navigation,
  route,
}: AICompatibilityScreenProps): React.JSX.Element => {
  const { colors } = useTheme();

  // Use the custom hook to manage all business logic
  const {
    isAnalyzing,
    compatibilityResult,
    error,
    availablePets,
    isLoadingPets,
    selectedPet1,
    selectedPet2,
    setSelectedPet1,
    setSelectedPet2,
    analyzeCompatibility,
    resetAnalysis,
    handleGoBack,
    clearError,
  } = useAICompatibilityScreen(route);

  useEffect(() => {
    // Load pets if route params are provided
    if (route?.params?.petAId && route?.params?.petBId) {
      // Pet selection is handled by the hook
    }
  }, [route?.params]);

  const handleAnalyzePress = () => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert(
        "Selection Required",
        "Please select two pets to analyze compatibility",
      );
      return;
    }

    if (selectedPet1._id === selectedPet2._id) {
      Alert.alert("Invalid Selection", "Please select two different pets");
      return;
    }

    analyzeCompatibility();
  };

  // Loading state
  if (isLoadingPets) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.background },
        ])}
        testID="AICompatibilityScreen"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading pets...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
      testID="AICompatibilityScreen"
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="back-button"
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface }//>
          </TouchableOpacity>
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
            accessibilityRole="header"
          >
            AI Compatibility Analyzer
          </Text>
          <View style={styles.headerActions}>
            {compatibilityResult && (
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.historyButton,
                  { backgroundColor: colors.primary },
                ])}
                testID="history-button"
                accessibilityLabel="Reset analysis"
                accessibilityRole="button"
                onPress={resetAnalysis}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pet Selection Section */}
        <PetSelectionSection
          selectedPet1={selectedPet1}
          selectedPet2={selectedPet2}
          availablePets={availablePets}
          colors={colors}
          screenWidth={screenWidth}
          onSelectPet1={setSelectedPet1}
          onSelectPet2={setSelectedPet2}
        />

        {/* Analyze Button */}
        {selectedPet1 && selectedPet2 && !compatibilityResult && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.analyzeButton,
                { backgroundColor: colors.primary },
                isAnalyzing && styles.analyzeButtonDisabled,
              ])}
              testID="analyze-button"
              disabled={isAnalyzing}
              onPress={handleAnalyzePress}
              accessibilityLabel={
                isAnalyzing
                  ? "Analyzing compatibility"
                  : "Analyze compatibility"
              }
              accessibilityRole="button"
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics" size={20} color="#FFFFFF" />
                  <Text style={styles.analyzeButtonText}>
                    Analyze Compatibility
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {compatibilityResult && (
          <AnalysisResultsSection
            compatibilityResult={compatibilityResult}
            colors={colors}
            onReset={resetAnalysis}
          />
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text
              style={StyleSheet.flatten([
                styles.errorText,
                { color: "#F44336" },
              ])}
            >
              {error}
            </Text>
            <TouchableOpacity testID="dismiss-error-button" accessibilityLabel="Dismiss error" accessibilityRole="button" onPress={clearError} style={styles.dismissButton}>
              <Text style={{ color: colors.primary }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  analysisSection: {
    marginVertical: 24,
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    padding: 8,
  },
});

export default AICompatibilityScreen;
