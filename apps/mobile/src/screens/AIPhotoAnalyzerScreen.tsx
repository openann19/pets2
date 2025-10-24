import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import type { NavigationProp } from "../navigation/types";

const { width: screenWidth } = Dimensions.get("window");

interface AIPhotoAnalyzerScreenProps {
  navigation: NavigationProp;
}

interface PhotoAnalysisResult {
  breed_analysis: {
    primary_breed: string;
    confidence: number;
    secondary_breeds?: Array<{ breed: string; confidence: number }>;
  };
  health_assessment: {
    age_estimate: number;
    health_score: number;
    recommendations: string[];
  };
  photo_quality: {
    overall_score: number;
    lighting_score: number;
    composition_score: number;
    clarity_score: number;
  };
  matchability_score: number;
  ai_insights: string[];
}

export default function AIPhotoAnalyzerScreen({
  navigation,
}: AIPhotoAnalyzerScreenProps) {
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] =
    useState<PhotoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to analyze pet photos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setSelectedPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)); // Limit to 5 photos
        setError(null);
      }
    } catch (err) {
      logger.error("Error picking images:", { error });
      setError("Failed to select images. Please try again.");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your camera to take pet photos.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newPhoto = result.assets[0].uri;
        setSelectedPhotos((prev) => [...prev, newPhoto].slice(0, 5));
        setError(null);
      }
    } catch (err) {
      logger.error("Error taking photo:", { error });
      setError("Failed to take photo. Please try again.");
    }
  };

  const analyzePhotos = async () => {
    if (selectedPhotos.length === 0) {
      Alert.alert("No Photos", "Please select at least one photo to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await api.ai.analyzePhotos(selectedPhotos);
      setAnalysisResult(result);
    } catch (err: any) {
      logger.error("Photo analysis error:", { error });
      setError(err.message || "Failed to analyze photos. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAnalysis = () => {
    setSelectedPhotos([]);
    setAnalysisResult(null);
    setError(null);
  };

  const renderPhotoGrid = () => (
    <View style={styles.photoGrid}>
      {selectedPhotos.map((photo, index) => (
        <View key={index} style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              removePhoto(index);
            }}
          >
            <Ionicons name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      ))}

      {selectedPhotos.length < 5 && (
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImages}>
          <Ionicons name="add" size={32} color={colors.text} />
          <Text style={[styles.addPhotoText, { color: colors.text }]}>
            Add Photo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBreedAnalysis = () => {
    if (!analysisResult?.breed_analysis) return null;

    const { breed_analysis } = analysisResult;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🧬 Breed Analysis
        </Text>

        <View style={styles.breedCard}>
          <Text style={[styles.primaryBreed, { color: colors.primary }]}>
            {breed_analysis.primary_breed}
          </Text>
          <Text style={[styles.confidence, { color: colors.textSecondary }]}>
            {Math.round(breed_analysis.confidence * 100)}% confidence
          </Text>
        </View>

        {breed_analysis.secondary_breeds &&
          breed_analysis.secondary_breeds.length > 0 && (
            <View style={styles.secondaryBreeds}>
              <Text style={[styles.secondaryTitle, { color: colors.text }]}>
                Possible Mixed Breeds:
              </Text>
              {breed_analysis.secondary_breeds.map((breed, index) => (
                <View key={index} style={styles.secondaryBreedItem}>
                  <Text style={[styles.secondaryBreed, { color: colors.text }]}>
                    {breed.breed}
                  </Text>
                  <Text
                    style={[
                      styles.secondaryConfidence,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {Math.round(breed.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
      </View>
    );
  };

  const renderHealthAssessment = () => {
    if (!analysisResult?.health_assessment) return null;

    const { health_assessment } = analysisResult;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🏥 Health Assessment
        </Text>

        <View style={styles.healthCard}>
          <View style={styles.healthItem}>
            <Text style={[styles.healthLabel, { color: colors.text }]}>
              Estimated Age:
            </Text>
            <Text style={[styles.healthValue, { color: colors.primary }]}>
              {health_assessment.age_estimate} years
            </Text>
          </View>

          <View style={styles.healthItem}>
            <Text style={[styles.healthLabel, { color: colors.text }]}>
              Health Score:
            </Text>
            <Text style={[styles.healthValue, { color: colors.primary }]}>
              {Math.round(health_assessment.health_score * 100)}/100
            </Text>
          </View>
        </View>

        {health_assessment.recommendations.length > 0 && (
          <View style={styles.recommendations}>
            <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
              Recommendations:
            </Text>
            {health_assessment.recommendations.map((rec, index) => (
              <Text
                key={index}
                style={[styles.recommendation, { color: colors.textSecondary }]}
              >
                • {rec}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPhotoQuality = () => {
    if (!analysisResult?.photo_quality) return null;

    const { photo_quality } = analysisResult;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📸 Photo Quality
        </Text>

        <View style={styles.qualityCard}>
          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>
              Overall Score:
            </Text>
            <Text style={[styles.qualityValue, { color: colors.primary }]}>
              {Math.round(photo_quality.overall_score * 100)}/100
            </Text>
          </View>

          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>
              Lighting:
            </Text>
            <Text style={[styles.qualityValue, { color: colors.primary }]}>
              {Math.round(photo_quality.lighting_score * 100)}/100
            </Text>
          </View>

          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>
              Composition:
            </Text>
            <Text style={[styles.qualityValue, { color: colors.primary }]}>
              {Math.round(photo_quality.composition_score * 100)}/100
            </Text>
          </View>

          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>
              Clarity:
            </Text>
            <Text style={[styles.qualityValue, { color: colors.primary }]}>
              {Math.round(photo_quality.clarity_score * 100)}/100
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAIInsights = () => {
    if (!analysisResult?.ai_insights || analysisResult.ai_insights.length === 0)
      return null;

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🤖 AI Insights
        </Text>

        <View style={styles.insightsCard}>
          {analysisResult.ai_insights.map((insight, index) => (
            <Text
              key={index}
              style={[styles.insight, { color: colors.textSecondary }]}
            >
              • {insight}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderMatchabilityScore = () => {
    if (!analysisResult?.matchability_score) return null;

    const score = Math.round(analysisResult.matchability_score * 100);
    const getScoreColor = (score: number) => {
      if (score >= 80) return "#4CAF50";
      if (score >= 60) return "#FF9800";
      return "#F44336";
    };

    return (
      <View style={styles.analysisSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          💕 Matchability Score
        </Text>

        <View style={styles.scoreCard}>
          <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
            {score}/100
          </Text>
          <Text
            style={[styles.scoreDescription, { color: colors.textSecondary }]}
          >
            {score >= 80
              ? "Excellent for matching!"
              : score >= 60
                ? "Good matching potential"
                : "Consider improving photos"}
          </Text>
        </View>
      </View>
    );
  };

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
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Photo Analyzer</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!analysisResult ? (
          <>
            <View style={styles.uploadSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📷 Select Pet Photos
              </Text>
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Upload up to 5 photos of your pet for AI analysis. Include
                clear, well-lit photos for best results.
              </Text>

              {renderPhotoGrid()}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cameraButton]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.galleryButton]}
                  onPress={pickImages}
                >
                  <Ionicons name="images" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>From Gallery</Text>
                </TouchableOpacity>
              </View>

              {selectedPhotos.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    { opacity: isAnalyzing ? 0.7 : 1 },
                  ]}
                  onPress={analyzePhotos}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="analytics" size={20} color="#fff" />
                  )}
                  <Text style={styles.analyzeButtonText}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Photos"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  🎯 Analysis Results
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetAnalysis}
                >
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                  <Text
                    style={[styles.resetButtonText, { color: colors.primary }]}
                  >
                    New Analysis
                  </Text>
                </TouchableOpacity>
              </View>

              {renderMatchabilityScore()}
              {renderBreedAnalysis()}
              {renderHealthAssessment()}
              {renderPhotoQuality()}
              {renderAIInsights()}
            </View>
          </>
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
  uploadSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  photoContainer: {
    width: (screenWidth - 60) / 3,
    height: (screenWidth - 60) / 3,
    marginBottom: 10,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addPhotoButton: {
    width: (screenWidth - 60) / 3,
    height: (screenWidth - 60) / 3,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.48,
  },
  cameraButton: {
    backgroundColor: "#4CAF50",
  },
  galleryButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C27B0",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  analyzeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  resetButtonText: {
    marginLeft: 5,
    fontWeight: "bold",
  },
  analysisSection: {
    marginBottom: 25,
  },
  scoreCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scoreDescription: {
    fontSize: 16,
    textAlign: "center",
  },
  breedCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  primaryBreed: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
  },
  secondaryBreeds: {
    marginTop: 15,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  secondaryBreedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  secondaryBreed: {
    fontSize: 14,
  },
  secondaryConfidence: {
    fontSize: 14,
  },
  healthCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
  },
  healthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 16,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recommendations: {
    marginTop: 15,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  qualityCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
  },
  qualityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  qualityLabel: {
    fontSize: 16,
  },
  qualityValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  insightsCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
  },
  insight: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
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
