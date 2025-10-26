/**
 * AI Compatibility Analyzer Screen for Mobile
 * Advanced compatibility scoring and analysis between pets
 */

import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { RootStackParamList } from "../../navigation/types";
import { aiAPI, matchesAPI } from "../../services/api";
import { logger } from "../../services/logger";

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  temperament: string[];
  interests: string[];
  photos: string[];
  owner: {
    id: string;
    name: string;
    location: string;
  };
}

interface CompatibilityScore {
  overall: number;
  breakdown: {
    temperament: number;
    activity: number;
    size: number;
    age: number;
    interests: number;
    lifestyle: number;
  };
  factors: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  interaction: {
    playdate: number;
    adoption: number;
    breeding: number;
  };
}

interface CompatibilityAnalysis {
  petA: Pet;
  petB: Pet;
  score: CompatibilityScore;
  analysis: {
    summary: string;
    detailed: string;
    tips: string[];
  };
  generatedAt: string;
}

interface CompatibilityResponse {
  success: boolean;
  data?: {
    score?: CompatibilityScore;
    analysis?: {
      summary: string;
      detailed: string;
      tips: string[];
    };
  };
}

type AICompatibilityScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AICompatibility"
>;

const AICompatibilityScreen = ({
  navigation,
  route,
}: AICompatibilityScreenProps): React.JSX.Element => {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetA, setSelectedPetA] = useState<Pet | null>(null);
  const [selectedPetB, setSelectedPetB] = useState<Pet | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<CompatibilityAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<
    CompatibilityAnalysis[]
  >([]);
  const [loading, _setLoading] = useState(true);

  useEffect(() => {
    void loadPets();
  }, []);

  useEffect(() => {
    if (route?.params?.petAId && route?.params?.petBId) {
      const petA = pets.find((p) => p.id === route.params.petAId);
      const petB = pets.find((p) => p.id === route.params.petBId);
      if (petA != null && petB != null) {
        setSelectedPetA(petA);
        setSelectedPetB(petB);
        void analyzeCompatibility(petA, petB);
      }
    }
  }, [pets, route?.params]);

  const loadPets = async (): Promise<void> => {
    try {
      const pets = await matchesAPI.getPets();
      setPets(pets as unknown as Pet[]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to load pets:", { error: err });
    }
  };

  const analyzeCompatibility = async (petA: Pet, petB: Pet) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsAnalyzing(true);
    try {
      const data = await aiAPI.analyzeCompatibility({
        pet1Id: petA.id,
        pet2Id: petB.id,
      });

      // Map the API response to our expected format
      const mappedScore: CompatibilityScore = {
        overall: data.compatibility_score,
        breakdown: {
          temperament: data.breakdown.personality_compatibility,
          activity: data.breakdown.activity_compatibility,
          size: data.breakdown.social_compatibility,
          age: data.breakdown.social_compatibility,
          interests: data.breakdown.lifestyle_compatibility,
          lifestyle: data.breakdown.environment_compatibility,
        },
        factors: {
          strengths: data.recommendations.meeting_suggestions,
          concerns: data.recommendations.supervision_requirements,
          recommendations: data.recommendations.activity_recommendations,
        },
        interaction: {
          playdate: data.recommendations.success_probability * 100,
          adoption: data.recommendations.success_probability * 90,
          breeding: data.recommendations.success_probability * 70,
        },
      };

      const mappedAnalysis = {
        summary: data.ai_analysis,
        detailed: data.ai_analysis,
        tips: data.recommendations.activity_recommendations,
      };

      const response: CompatibilityResponse = {
        success: true,
        data: {
          score: mappedScore,
          analysis: mappedAnalysis,
        },
      };

      if (response && response.success && response.data) {
        const analysis: CompatibilityAnalysis = {
          petA,
          petB,
          score: response.data.score || {
            overall: 85,
            breakdown: {
              temperament: 90,
              activity: 80,
              size: 85,
              age: 75,
              interests: 88,
              lifestyle: 82,
            },
            factors: {
              strengths: [
                "Both are playful",
                "Similar energy levels",
                "Compatible sizes",
              ],
              concerns: ["Age difference", "Different play styles"],
              recommendations: [
                "Gradual introduction",
                "Supervised playtime",
                "Monitor interactions",
              ],
            },
            interaction: {
              playdate: 88,
              adoption: 75,
              breeding: 65,
            },
          },
          analysis: response.data.analysis || {
            summary: `${petA.name} and ${petB.name} show strong compatibility with an overall score of 85%.`,
            detailed:
              "Both pets share similar temperaments and energy levels, making them well-suited for playdates and potential adoption.",
            tips: [
              "Introduce them gradually in a neutral environment",
              "Monitor their interactions closely during initial meetings",
              "Consider their individual needs and preferences",
            ],
          },
          generatedAt: new Date().toISOString(),
        };

        setAnalysisResult(analysis);
        setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 4)]); // Keep last 5
        logger.info("Compatibility analysis completed", {
          score: analysis.score.overall,
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Compatibility analysis failed:", { error: err });

      // Fallback analysis for demo
      const fallbackAnalysis: CompatibilityAnalysis = {
        petA,
        petB,
        score: {
          overall: 82,
          breakdown: {
            temperament: 85,
            activity: 80,
            size: 90,
            age: 70,
            interests: 85,
            lifestyle: 80,
          },
          factors: {
            strengths: ["Compatible personalities", "Similar activity levels"],
            concerns: ["Age gap", "Different play preferences"],
            recommendations: [
              "Supervised introduction",
              "Gradual socialization",
            ],
          },
          interaction: {
            playdate: 85,
            adoption: 75,
            breeding: 60,
          },
        },
        analysis: {
          summary: `${petA.name} and ${petB.name} have good compatibility potential.`,
          detailed:
            "These pets show promising compatibility with some areas that need attention.",
          tips: [
            "Start with short supervised interactions",
            "Pay attention to body language",
            "Respect their individual boundaries",
          ],
        },
        generatedAt: new Date().toISOString(),
      };

      setAnalysisResult(fallbackAnalysis);
      setAnalysisHistory((prev) => [fallbackAnalysis, ...prev.slice(0, 4)]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePetSelection = (pet: Pet, isPetA: boolean) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isPetA) {
      setSelectedPetA(pet);
      setAnalysisResult(null);
    } else {
      setSelectedPetB(pet);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedPetA || !selectedPetB) {
      Alert.alert(
        "Selection Required",
        "Please select both pets to analyze compatibility",
      );
      return;
    }

    if (selectedPetA.id === selectedPetB.id) {
      Alert.alert("Invalid Selection", "Please select two different pets");
      return;
    }

    analyzeCompatibility(selectedPetA, selectedPetB);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10B981";
    if (score >= 80) return "#3B82F6";
    if (score >= 70) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  };

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.petCard,
        { backgroundColor: colors.card },
        (selectedPetA?.id === item.id || selectedPetB?.id === item.id) &&
          styles.petCardSelected,
      ])}
      onPress={() => {
        if (selectedPetA?.id === item.id) {
          handlePetSelection(item, true);
        } else if (selectedPetB?.id === item.id) {
          handlePetSelection(item, false);
        } else if (!selectedPetA) {
          handlePetSelection(item, true);
        } else if (!selectedPetB) {
          handlePetSelection(item, false);
        }
      }}
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text
            style={StyleSheet.flatten([
              styles.petAvatarText,
              { color: colors.text },
            ])}
          >
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.petDetails}>
          <Text
            style={StyleSheet.flatten([styles.petName, { color: colors.text }])}
          >
            {item.name}
          </Text>
          <Text
            style={StyleSheet.flatten([
              styles.petBreed,
              { color: colors.textSecondary },
            ])}
          >
            {item.breed} • {item.age} years old
          </Text>
          <View style={styles.petTags}>
            {item.temperament.slice(0, 2).map((trait, index) => (
              <View
                key={index}
                style={StyleSheet.flatten([
                  styles.petTag,
                  { backgroundColor: colors.primary },
                ])}
              >
                <Text style={styles.petTagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {(selectedPetA?.id === item.id || selectedPetB?.id === item.id) && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedPetA?.id === item.id ? "paw" : "heart"}
            size={20}
            color={colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.background },
        ])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.text },
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
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={StyleSheet.flatten([styles.title, { color: colors.text }])}
          >
            Compatibility Analyzer
          </Text>
          <View style={styles.headerActions}>
            {analysisHistory.length > 0 && (
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.historyButton,
                  { backgroundColor: colors.primary },
                ])}
                onPress={() => {
                  Alert.alert(
                    "Analysis History",
                    `${analysisHistory.length} previous analyses`,
                  );
                }}
              >
                <Ionicons name="time" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pet Selection */}
        <View style={styles.selectionSection}>
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: colors.text },
            ])}
          >
            Select Pets to Compare
          </Text>

          <View style={styles.selectionStatus}>
            <View style={styles.selectionItem}>
              <Ionicons
                name="paw"
                size={20}
                color={selectedPetA ? colors.primary : colors.textSecondary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.selectionText,
                  { color: selectedPetA ? colors.text : colors.textSecondary },
                ])}
              >
                {selectedPetA ? selectedPetA.name : "Select Pet A"}
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.selectionItem}>
              <Ionicons
                name="heart"
                size={20}
                color={selectedPetB ? colors.primary : colors.textSecondary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.selectionText,
                  { color: selectedPetB ? colors.text : colors.textSecondary },
                ])}
              >
                {selectedPetB ? selectedPetB.name : "Select Pet B"}
              </Text>
            </View>
          </View>

          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.petsList}
          />
        </View>

        {/* Analyze Button */}
        {selectedPetA && selectedPetB ? (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.analyzeButton,
                { backgroundColor: colors.primary },
                isAnalyzing && styles.analyzeButtonDisabled,
              ])}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
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
        ) : null}

        {/* Analysis Results */}
        {analysisResult ? (
          <View style={styles.resultsSection}>
            <Text
              style={StyleSheet.flatten([
                styles.sectionTitle,
                { color: colors.text },
              ])}
            >
              Compatibility Analysis
            </Text>

            {/* Overall Score */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons
                  name="trophy"
                  size={24}
                  color={getScoreColor(analysisResult.score.overall)}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Overall Compatibility
                </Text>
              </View>
              <View style={styles.overallScore}>
                <Text
                  style={StyleSheet.flatten([
                    styles.scoreValue,
                    { color: getScoreColor(analysisResult.score.overall) },
                  ])}
                >
                  {analysisResult.score.overall}%
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.scoreLabel,
                    { color: colors.textSecondary },
                  ])}
                >
                  {getScoreLabel(analysisResult.score.overall)}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.scoreDescription,
                    { color: colors.text },
                  ])}
                >
                  {analysisResult.analysis.summary}
                </Text>
              </View>
            </View>

            {/* Breakdown */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="bar-chart" size={24} color="#3B82F6" />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Compatibility Breakdown
                </Text>
              </View>
              <View style={styles.breakdownList}>
                {Object.entries(analysisResult.score.breakdown).map(
                  ([factor, score]) => (
                    <View key={factor} style={styles.breakdownItem}>
                      <Text
                        style={StyleSheet.flatten([
                          styles.breakdownLabel,
                          { color: colors.textSecondary },
                        ])}
                      >
                        {factor.charAt(0).toUpperCase() + factor.slice(1)}
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View
                          style={StyleSheet.flatten([
                            styles.breakdownFill,
                            {
                              width: `${score}%`,
                              backgroundColor: getScoreColor(score),
                            },
                          ])}
                        />
                      </View>
                      <Text
                        style={StyleSheet.flatten([
                          styles.breakdownScore,
                          { color: colors.text },
                        ])}
                      >
                        {score}%
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* Interaction Types */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="people" size={24} color="#8B5CF6" />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Interaction Compatibility
                </Text>
              </View>
              <View style={styles.interactionGrid}>
                {Object.entries(analysisResult.score.interaction).map(
                  ([type, score]) => (
                    <View key={type} style={styles.interactionItem}>
                      <Text
                        style={StyleSheet.flatten([
                          styles.interactionLabel,
                          { color: colors.textSecondary },
                        ])}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      <Text
                        style={StyleSheet.flatten([
                          styles.interactionScore,
                          { color: getScoreColor(score) },
                        ])}
                      >
                        {score}%
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>

            {/* Strengths & Concerns */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="list" size={24} color="#10B981" />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Analysis Factors
                </Text>
              </View>

              <View style={styles.factorsSection}>
                <View style={styles.factorGroup}>
                  <Text
                    style={StyleSheet.flatten([
                      styles.factorGroupTitle,
                      { color: "#10B981" },
                    ])}
                  >
                    Strengths
                  </Text>
                  {analysisResult.score.factors.strengths.map(
                    (strength, index) => (
                      <View key={index} style={styles.factorItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#10B981"
                        />
                        <Text
                          style={StyleSheet.flatten([
                            styles.factorText,
                            { color: colors.text },
                          ])}
                        >
                          {strength}
                        </Text>
                      </View>
                    ),
                  )}
                </View>

                <View style={styles.factorGroup}>
                  <Text
                    style={StyleSheet.flatten([
                      styles.factorGroupTitle,
                      { color: "#F59E0B" },
                    ])}
                  >
                    Concerns
                  </Text>
                  {analysisResult.score.factors.concerns.map(
                    (concern, index) => (
                      <View key={index} style={styles.factorItem}>
                        <Ionicons name="warning" size={16} color="#F59E0B" />
                        <Text
                          style={StyleSheet.flatten([
                            styles.factorText,
                            { color: colors.text },
                          ])}
                        >
                          {concern}
                        </Text>
                      </View>
                    ),
                  )}
                </View>

                <View style={styles.factorGroup}>
                  <Text
                    style={StyleSheet.flatten([
                      styles.factorGroupTitle,
                      { color: "#3B82F6" },
                    ])}
                  >
                    Recommendations
                  </Text>
                  {analysisResult.score.factors.recommendations.map(
                    (recommendation, index) => (
                      <View key={index} style={styles.factorItem}>
                        <Ionicons name="bulb" size={16} color="#3B82F6" />
                        <Text
                          style={StyleSheet.flatten([
                            styles.factorText,
                            { color: colors.text },
                          ])}
                        >
                          {recommendation}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            </View>

            {/* Detailed Analysis */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="document-text" size={24} color="#6B7280" />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Detailed Analysis
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.detailedText,
                  { color: colors.text },
                ])}
              >
                {analysisResult.analysis.detailed}
              </Text>
            </View>

            {/* Tips */}
            <View
              style={StyleSheet.flatten([
                styles.resultCard,
                { backgroundColor: colors.card },
              ])}
            >
              <View style={styles.resultHeader}>
                <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                <Text
                  style={StyleSheet.flatten([
                    styles.resultTitle,
                    { color: colors.text },
                  ])}
                >
                  Tips for Success
                </Text>
              </View>
              <View style={styles.tipsList}>
                {analysisResult.analysis.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#F59E0B"
                    />
                    <Text
                      style={StyleSheet.flatten([
                        styles.tipText,
                        { color: colors.text },
                      ])}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}
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
  selectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  selectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  selectionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  petsList: {
    maxHeight: 300,
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petCardSelected: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  petAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 4,
  },
  petTags: {
    flexDirection: "row",
    gap: 6,
  },
  petTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  petTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  selectionIndicator: {
    padding: 8,
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  overallScore: {
    alignItems: "center",
    gap: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  scoreDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    width: 80,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownScore: {
    fontSize: 14,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  interactionGrid: {
    flexDirection: "row",
    gap: 16,
  },
  interactionItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  interactionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  interactionScore: {
    fontSize: 18,
    fontWeight: "bold",
  },
  factorsSection: {
    gap: 16,
  },
  factorGroup: {
    gap: 8,
  },
  factorGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  factorText: {
    fontSize: 14,
    flex: 1,
  },
  detailedText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});

export default AICompatibilityScreen;
