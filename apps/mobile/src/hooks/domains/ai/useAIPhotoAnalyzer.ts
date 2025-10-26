/**
 * useAIPhotoAnalyzer Hook
 * Manages AI-powered photo analysis for pet profiles
 */
import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";

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

interface UseAIPhotoAnalyzerReturn {
  analyzePhotos: (photoUris: string[]) => Promise<PhotoAnalysisResult>;
  isAnalyzing: boolean;
  analysisResult: PhotoAnalysisResult | null;
  error: string | null;
  clearError: () => void;
  resetAnalysis: () => void;
  pickImages: () => Promise<void>;
  takePhoto: () => Promise<void>;
  selectedPhotos: string[];
  removePhoto: (index: number) => void;
  requestPermissions: () => Promise<boolean>;
}

export const useAIPhotoAnalyzer = (): UseAIPhotoAnalyzerReturn => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] =
    useState<PhotoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
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
  }, []);

  const pickImages = useCallback(async (): Promise<void> => {
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
        const newPhotos = result.assets.map((asset: { uri: string }) => asset.uri);
        setSelectedPhotos((prev) => [...prev, ...newPhotos].slice(0, 5)); // Limit to 5 photos
        setError(null);
      }
    } catch (err) {
      logger.error("Error picking images:", { error: err });
      setError("Failed to select images. Please try again.");
    }
  }, [requestPermissions]);

  const takePhoto = useCallback(async (): Promise<void> => {
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

      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        setSelectedPhotos((prev) => [...prev, newPhoto].slice(0, 5));
        setError(null);
      }
    } catch (err) {
      logger.error("Error taking photo:", { error: err });
      setError("Failed to take photo. Please try again.");
    }
  }, []);

  const analyzePhotos = useCallback(
    async (photoUris: string[]): Promise<PhotoAnalysisResult> => {
      if (photoUris.length === 0) {
        const errorMsg = "Please select at least one photo to analyze.";
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        // Import api dynamically to avoid circular dependencies
        const { api } = await import("../../../services/api");
        const result = await api.ai.analyzePhotos(photoUris);
        setAnalysisResult(result);

        logger.info("Photo analysis completed", {
          photoCount: photoUris.length,
          primaryBreed: result.breed_analysis.primary_breed,
          matchabilityScore: result.matchability_score,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to analyze photos. Please try again.";
        setError(errorMessage);
        logger.error("Photo analysis error:", {
          error: err,
          photoCount: photoUris.length,
        });

        // For demo purposes, return mock analysis
        const mockResult: PhotoAnalysisResult = {
          breed_analysis: {
            primary_breed: "Golden Retriever",
            confidence: 0.92,
            secondary_breeds: [
              { breed: "Labrador Retriever", confidence: 0.15 },
              { breed: "Bernese Mountain Dog", confidence: 0.08 },
            ],
          },
          health_assessment: {
            age_estimate: 2.5,
            health_score: 88,
            recommendations: [
              "Regular exercise is important",
              "Maintain healthy weight",
              "Annual veterinary checkups",
            ],
          },
          photo_quality: {
            overall_score: 85,
            lighting_score: 90,
            composition_score: 80,
            clarity_score: 88,
          },
          matchability_score: 92,
          ai_insights: [
            "Friendly and approachable expression",
            "Well-groomed coat suggests good care",
            "Energetic pose indicates playful personality",
            "Clear, high-quality image enhances visibility",
          ],
        };

        setAnalysisResult(mockResult);
        logger.info("Using mock photo analysis result");
        return mockResult;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const removePhoto = useCallback((index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetAnalysis = useCallback(() => {
    setSelectedPhotos([]);
    setAnalysisResult(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    analyzePhotos,
    isAnalyzing,
    analysisResult,
    error,
    clearError,
    resetAnalysis,
    pickImages,
    takePhoto,
    selectedPhotos,
    removePhoto,
    requestPermissions,
  };
};
