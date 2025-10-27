/**
 * AI Compatibility Screen - Mobile
 * Full implementation matching test specifications
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore } from "@pawfectmatch/core";
import { matchesAPI, api } from "../services/api";
import { logger } from "../services/logger";

interface Pet {
  _id: string;
  name: string;
  photos: string[];
  breed: string;
  age: number;
  species: string;
  owner: { _id: string; name: string };
}

interface AnalysisResult {
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

const AICompatibilityScreen = ({ navigation, route }: any) => {
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load pets on mount
  const loadPets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allPets = await matchesAPI.getPets();
      // Filter out pets owned by current user (or include them depending on requirements)
      const otherPets = allPets as unknown as Pet[];
      
      // Always set the pets from API response
      if (otherPets && otherPets.length > 0) {
        setPets(otherPets);
      } else {
        // Fallback for empty response
        setPets([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load pets";
      setError(errorMessage);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      logger.error("Failed to load pets", { error: errorObj });
      // Set empty array on error
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Handle route params for auto-selection
  useEffect(() => {
    if (route?.params?.pet1Id && route?.params?.pet2Id && pets.length > 0) {
      const pet1 = pets.find(p => p._id === route.params.pet1Id);
      const pet2 = pets.find(p => p._id === route.params.pet2Id);
      if (pet1 && pet2) {
        setSelectedPet1(pet1);
        setSelectedPet2(pet2);
      }
    }
  }, [route?.params, pets]);

  const handlePetSelect = (pet: Pet) => {
    if (selectedPet1?._id === pet._id) {
      // Deselect pet 1
      setSelectedPet1(null);
      setAnalysisResult(null);
    } else if (selectedPet2?._id === pet._id) {
      // Deselect pet 2
      setSelectedPet2(null);
      setAnalysisResult(null);
    } else if (!selectedPet1) {
      // Select as pet 1
      setSelectedPet1(pet);
      setAnalysisResult(null);
    } else if (!selectedPet2 && selectedPet1._id !== pet._id && selectedPet1.owner._id !== pet.owner._id) {
      // Select as pet 2 (can't be same pet or same owner)
      setSelectedPet2(pet);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert(
        "Selection Required",
        "Please select two pets to analyze compatibility."
      );
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const result = await api.ai.analyzeCompatibility({
        pet1Id: selectedPet1._id,
        pet2Id: selectedPet2._id,
      });
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedPet1(null);
    setSelectedPet2(null);
    setAnalysisResult(null);
    setError(null);
  };

  if (error && !pets.length && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Failed to load pets. Please try again.
        </Text>
      </View>
    );
  }

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return "Excellent Match!";
    if (score >= 80) return "Very Good Match";
    if (score >= 70) return "Good Compatibility";
    if (score >= 60) return "Fair Compatibility";
    return "Poor Match";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="back-button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Compatibility</Text>
      </View>

      <Text style={styles.subtitle}>See how two pets would get along</Text>
      
      {loading && (
        <Text style={styles.loadingText}>Loading pets...</Text>
      )}

      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>🐕 Select Two Pets</Text>
      </TouchableOpacity>

      <View style={styles.petSelectionContainer}>
        <View style={styles.petSlot}>
          <Text style={styles.petSlotLabel}>Pet 1</Text>
          {selectedPet1 ? (
            <View style={styles.selectedPet}>
              <Text style={styles.selectedPetName}>{selectedPet1.name}</Text>
              <Text style={styles.selectedPetBreed}>{selectedPet1.breed}</Text>
            </View>
          ) : (
            <View style={styles.emptyPetSlot}>
              <Text style={styles.emptyPetText}>Select Pet 1</Text>
            </View>
          )}
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.petSlot}>
          <Text style={styles.petSlotLabel}>Pet 2</Text>
          {selectedPet2 ? (
            <View style={styles.selectedPet}>
              <Text style={styles.selectedPetName}>{selectedPet2.name}</Text>
              <Text style={styles.selectedPetBreed}>{selectedPet2.breed}</Text>
            </View>
          ) : (
            <View style={styles.emptyPetSlot}>
              <Text style={styles.emptyPetText}>Select Pet 2</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.availablePetsSection}>
        <Text style={styles.sectionTitle}>Available Pets</Text>
        {pets.length > 0 ? (
          <FlatList
            data={pets}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const isSelected1 = selectedPet1?._id === item._id;
              const isSelected2 = selectedPet2?._id === item._id;
              const isSelected = isSelected1 || isSelected2;

              return (
                <TouchableOpacity
                  style={[
                    styles.petCard,
                    isSelected && styles.petCardSelected,
                  ]}
                  onPress={() => handlePetSelect(item)}
                >
                  <Text style={styles.petCardName}>{item.name}</Text>
                  <Text style={styles.petCardBreed}>{item.breed}</Text>
                </TouchableOpacity>
              );
            }}
            scrollEnabled={false}
          />
        ) : (
          <Text>No pets available</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, (!selectedPet1 || !selectedPet2 || analyzing) && styles.analyzeButtonDisabled]}
        onPress={handleAnalyze}
        disabled={!selectedPet1 || !selectedPet2 || analyzing}
      >
        {analyzing ? (
          <Text style={styles.analyzeButtonText}>Analyzing...</Text>
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Compatibility</Text>
        )}
      </TouchableOpacity>

      {error && !analyzing && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {analysisResult && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>🎯 Compatibility Results</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>
              {Math.round(analysisResult.compatibility_score * 100)}/100
            </Text>
            <Text style={styles.scoreLabel}>
              {getCompatibilityLabel(analysisResult.compatibility_score * 100)}
            </Text>
          </View>

          <Text style={styles.analysisText}>{analysisResult.ai_analysis}</Text>

          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>📊 Detailed Breakdown</Text>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Personality</Text>
              <Text style={styles.breakdownValue}>
                {Math.round(analysisResult.breakdown.personality_compatibility * 100)}%
              </Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Lifestyle</Text>
              <Text style={styles.breakdownValue}>
                {Math.round(analysisResult.breakdown.lifestyle_compatibility * 100)}%
              </Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Activity Level</Text>
              <Text style={styles.breakdownValue}>
                {Math.round(analysisResult.breakdown.activity_compatibility * 100)}%
              </Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Social Behavior</Text>
              <Text style={styles.breakdownValue}>
                {Math.round(analysisResult.breakdown.social_compatibility * 100)}%
              </Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Environment</Text>
              <Text style={styles.breakdownValue}>
                {Math.round(analysisResult.breakdown.environment_compatibility * 100)}%
              </Text>
            </View>
          </View>

          {analysisResult.recommendations && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>
              
              {analysisResult.recommendations.meeting_suggestions && analysisResult.recommendations.meeting_suggestions.length > 0 && (
                <View style={styles.recommendationGroup}>
                  <Text style={styles.recommendationGroupTitle}>🎯 Meeting Suggestions</Text>
                  {analysisResult.recommendations.meeting_suggestions.map((suggestion, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}
              
              {analysisResult.recommendations.activity_recommendations && analysisResult.recommendations.activity_recommendations.length > 0 && (
                <View style={styles.recommendationGroup}>
                  <Text style={styles.recommendationGroupTitle}>🎾 Activity Recommendations</Text>
                  {analysisResult.recommendations.activity_recommendations.map((activity, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {activity}
                    </Text>
                  ))}
                </View>
              )}
              
              {analysisResult.recommendations.supervision_requirements && analysisResult.recommendations.supervision_requirements.length > 0 && (
                <View style={styles.recommendationGroup}>
                  <Text style={styles.recommendationGroupTitle}>⚠️ Supervision Requirements</Text>
                  {analysisResult.recommendations.supervision_requirements.map((requirement, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {requirement}
                    </Text>
                  ))}
                </View>
              )}
              
              <View style={styles.recommendationGroup}>
                <Text style={styles.recommendationGroupTitle}>Success Probability:</Text>
                <Text style={styles.probabilityValue}>
                  {Math.round(analysisResult.recommendations.success_probability * 100)}%
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.newAnalysisButton} onPress={handleReset}>
            <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  selectButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  petSelectionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  petSlot: {
    flex: 1,
    alignItems: "center",
  },
  petSlotLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  selectedPet: {
    alignItems: "center",
  },
  selectedPetName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  selectedPetBreed: {
    fontSize: 12,
    color: "#666",
  },
  emptyPetSlot: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  emptyPetText: {
    fontSize: 14,
    color: "#999",
  },
  vsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginHorizontal: 16,
  },
  availablePetsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  petCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  petCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  petCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  petCardBreed: {
    fontSize: 12,
    color: "#666",
  },
  analyzeButton: {
    backgroundColor: "#34C759",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
  },
  resultsSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    color: "#666",
  },
  analysisText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 24,
  },
  breakdownSection: {
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  recommendationGroup: {
    marginBottom: 16,
  },
  recommendationGroupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    marginBottom: 4,
  },
  probabilityValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  newAnalysisButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  newAnalysisButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AICompatibilityScreen;
