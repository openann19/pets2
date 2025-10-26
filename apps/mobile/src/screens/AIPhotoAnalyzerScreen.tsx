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

import { useAIPhotoAnalyzerScreen } from "../hooks/screens/useAIPhotoAnalyzerScreen";
import { useTheme } from "../contexts/ThemeContext";
import type { NavigationProp } from "../navigation/types";
import {
  PhotoUploadSection,
  AnalysisResultsSection,
} from "./ai/photoanalyzer";

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
  const { isDark, colors } = useTheme();

  const {
    isAnalyzing,
    analysisResult,
    error,
    selectedPhotos,
    pickImages,
    takePhoto,
    analyzePhotos,
    removePhoto,
    resetAnalysis,
    clearError,
  } = useAIPhotoAnalyzerScreen();

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
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
            <PhotoUploadSection
              selectedImage={selectedPhotos[0] || null}
              onImageSelected={pickImages}
              colors={colors}
            />

            {selectedPhotos.length > 0 && (
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.analyzeButton,
                  { opacity: isAnalyzing ? 0.7 : 1 },
                ])}
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
  errorDismiss: {
    marginRight: 8,
  },
  errorText: {
    color: "#c62828",
    flex: 1,
  },
});
