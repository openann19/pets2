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
import { PhotoUploadSection, AnalysisResultsSection } from './ai/photoanalyzer';

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

      if (!result.canceled && result.assets && result.assets[0] !== undefined) {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze photos. Please try again.";
      logger.error("Photo analysis error:", { error: err });
      setError(message);
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
        <Text style={styles.headerTitle}>AI Photo Analyzer</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!analysisResult ? (
          <>
            <PhotoUploadSection
              selectedImage={selectedPhotos[0] || null}
              onImageSelected={(uri) => setSelectedPhotos([uri])}
              colors={colors}
            />

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
          </>
        ) : (
          <AnalysisResultsSection result={analysisResult} colors={colors} />
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
