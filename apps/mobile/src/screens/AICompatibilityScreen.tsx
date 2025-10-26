import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api, matchesAPI } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import type { NavigationProp, RouteProp } from "../navigation/types";
import { PetSelectionSection, AnalysisResultsSection } from './ai/compatibility';

const { width: screenWidth } = Dimensions.get("window");

interface AICompatibilityScreenProps {
  navigation: NavigationProp;
  route?: RouteProp;
}

interface Pet {
  _id: string;
  name: string;
  photos: string[];
  breed: string;
  age: number;
  species: string;
  owner: {
    _id: string;
    name: string;
  };
}

interface CompatibilityResult {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: {
    personality_compatibility: number;
    lifestyle_compatibility: number;
    activity_compatibility: number;
    social_compatibility: number;
    environment_compatibility: number;
  };
  recommendations: {
    meeting_suggestions: string[];
    activity_recommendations: string[];
    supervision_requirements: string[];
    success_probability: number;
  };
}

export default function AICompatibilityScreen({
  navigation,
  route,
}: AICompatibilityScreenProps) {
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();

  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);
  const [compatibilityResult, setCompatibilityResult] =
    useState<CompatibilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailablePets();

    // Check if pets were passed via route params
    const params = route?.params as { petAId?: string; petBId?: string } | undefined;
    if (params?.petAId && params?.petBId) {
      // Load specific pets for analysis
      loadSpecificPets(params.petAId, params.petBId);
    }
  }, [route?.params]);

  const loadAvailablePets = async () => {
    try {
      setIsLoadingPets(true);
      // Fetch real pets from API
      const pets = await matchesAPI.getPets();
      
      // Filter out current user's pets
      const userData = user as { _id?: string } | undefined;
      const availablePets = pets.filter((pet) => {
        const petOwner = pet.owner as { _id?: string } | undefined;
        return petOwner?._id !== userData?._id;
      });
      
      setAvailablePets(availablePets as unknown as Pet[]);
    } catch (err: unknown) {
      logger.error("Error loading pets:", { error: err });
      setError("Failed to load pets. Please try again.");
    } finally {
      setIsLoadingPets(false);
    }
  };

  const loadSpecificPets = async (pet1Id: string, pet2Id: string) => {
    try {
      // In a real app, you'd fetch these pets from the API
      const pet1 = availablePets.find((p) => p._id === pet1Id);
      const pet2 = availablePets.find((p) => p._id === pet2Id);

      if (pet1 && pet2) {
        setSelectedPet1(pet1);
        setSelectedPet2(pet2);
        // Auto-analyze if both pets are selected
        setTimeout(() => analyzeCompatibility(), 500);
      }
    } catch (err: unknown) {
      logger.error("Error loading specific pets:", { error: err });
      setError("Failed to load pet information.");
    }
  };

  const analyzeCompatibility = async () => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert(
        "Selection Required",
        "Please select two pets to analyze compatibility.",
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.ai.analyzeCompatibility({
        pet1Id: selectedPet1._id,
        pet2Id: selectedPet2._id,
      });
      setCompatibilityResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze compatibility. Please try again.";
      logger.error("Compatibility analysis error:", { error: err });
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedPet1(null);
    setSelectedPet2(null);
    setCompatibilityResult(null);
    setError(null);
  };


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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => { navigation.goBack(); }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
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
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="analytics" size={20} color="#fff" />
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
    color: "#fff",
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
    color: "#fff",
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
  errorText: {
    color: "#c62828",
    marginLeft: 10,
    flex: 1,
  },
});
