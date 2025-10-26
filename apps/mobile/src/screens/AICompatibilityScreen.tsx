import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAICompatibilityScreen } from "../hooks/screens/useAICompatibilityScreen";
import { useTheme } from "../theme/Provider";
import type { NavigationProp, RouteProp } from "../navigation/types";
import {
  PetSelectionSection,
  AnalysisResultsSection,
} from "./ai/compatibility";

import { Theme } from '../theme/unified-theme';

const { width: screenWidth } = Dimensions.get("window");

interface AICompatibilityScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

export default function AICompatibilityScreen({
  navigation,
  route,
}: AICompatibilityScreenProps): React.JSX.Element {
  const { isDark, colors } = useTheme();

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
    clearError,
  } = useAICompatibilityScreen(route);

  if (isLoadingPets) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading pets...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={isDark ? ["#1a1a2e", "#16213e"] : ["#667eea", "#764ba2"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={24} color="Theme.colors.neutral[0]" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Compatibility</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!compatibilityResult ? (
          <>
            <PetSelectionSection
              selectedPet1={selectedPet1}
              selectedPet2={selectedPet2}
              availablePets={availablePets}
              colors={colors}
              screenWidth={screenWidth}
              onSelectPet1={setSelectedPet1}
              onSelectPet2={setSelectedPet2}
            />

            {selectedPet1 && selectedPet2 && (
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  { opacity: isAnalyzing ? 0.7 : 1 },
                ]}
                onPress={analyzeCompatibility}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="Theme.colors.neutral[0]" size="small" />
                ) : (
                  <Ionicons name="analytics" size={20} color="Theme.colors.neutral[0]" />
                )}
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? "Analyzing..." : "Analyze Compatibility"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <AnalysisResultsSection
            compatibilityResult={compatibilityResult}
            colors={colors}
            onReset={resetAnalysis}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#ff4444" />
            <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
              <Ionicons name="close" size={20} color="#c62828" />
            </TouchableOpacity>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[0]",
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C27B0",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  analyzeButtonText: {
    color: "Theme.colors.neutral[0]",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  errorDismiss: {
    marginRight: 8,
  },
  errorText: {
    color: "#c62828",
    flex: 1,
  },
});