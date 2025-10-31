/**
 * useAIPhotoAnalyzerScreen Hook
 * Manages AI Photo Analyzer screen state and interactions
 * Adapted for single-image photo analysis with transformation between formats
 */
import { useNavigation } from '@react-navigation/native';
import { useAIPhotoAnalyzer } from '../domains/ai/useAIPhotoAnalyzer';
import { useCallback, useState } from 'react';
import type { PhotoAnalysisResult } from '../../services/aiPhotoService';

interface UseAIPhotoAnalyzerScreenReturn {
  // State
  isAnalyzing: boolean;
  analysisResult: PhotoAnalysisResult | null;
  error: string | null;
  selectedImage: string | null;

  // Actions
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  analyzePhoto: () => Promise<void>;
  clearImage: () => void;
  handleGoBack: () => void;
  clearError: () => void;
}

export const useAIPhotoAnalyzerScreen = (): UseAIPhotoAnalyzerScreenReturn => {
  const navigation = useNavigation();
  const domain = useAIPhotoAnalyzer();

  // Single image state (UI-specific)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Adapt single image selection to domain hook's multi-photo interface
  const pickImage = useCallback(async (): Promise<void> => {
    await domain.pickImages();
    if (domain.selectedPhotos.length > 0) {
      setSelectedImage(domain.selectedPhotos[0] ?? null);
    }
  }, [domain]);

  const takePhoto = useCallback(async (): Promise<void> => {
    await domain.takePhoto();
    if (domain.selectedPhotos.length > 0) {
      setSelectedImage(domain.selectedPhotos[0] ?? null);
    }
  }, [domain]);

  const analyzePhoto = useCallback(async (): Promise<void> => {
    if (!selectedImage) return;

    try {
      await domain.analyzePhotos([selectedImage]);
    } catch (error) {
      // Error handling is done in the domain hook
    }
  }, [selectedImage, domain]);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    domain.resetAnalysis();
  }, [domain]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // State
    isAnalyzing: domain.isAnalyzing,
    analysisResult: domain.analysisResult,
    error: domain.error,
    selectedImage,

    // Actions
    pickImage,
    takePhoto,
    analyzePhoto,
    clearImage,
    handleGoBack,
    clearError: domain.clearError,
  };
};
