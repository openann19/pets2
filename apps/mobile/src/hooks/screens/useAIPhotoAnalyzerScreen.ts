/**
 * useAIPhotoAnalyzerScreen Hook
 * Manages AI Photo Analyzer screen state and interactions
 */
import { useNavigation } from "@react-navigation/native";
import { useAIPhotoAnalyzer } from "../domains/ai/useAIPhotoAnalyzer";

interface UseAIPhotoAnalyzerScreenReturn {
  // State from domain hook
  isAnalyzing: boolean;
  analysisResult: any | null;
  error: string | null;
  selectedPhotos: string[];

  // Actions
  pickImages: () => Promise<void>;
  takePhoto: () => Promise<void>;
  analyzePhotos: () => Promise<void>;
  removePhoto: (index: number) => void;
  resetAnalysis: () => void;
  handleGoBack: () => void;
  clearError: () => void;
}

export const useAIPhotoAnalyzerScreen = (): UseAIPhotoAnalyzerScreenReturn => {
  const navigation = useNavigation();
  const {
    analyzePhotos: analyzePhotosDomain,
    isAnalyzing,
    analysisResult,
    error,
    selectedPhotos,
    pickImages,
    takePhoto,
    removePhoto,
    resetAnalysis,
    clearError,
  } = useAIPhotoAnalyzer();

  const analyzePhotos = async () => {
    try {
      await analyzePhotosDomain(selectedPhotos);
    } catch (error) {
      // Error handling is done in the domain hook
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // State from domain hook
    isAnalyzing,
    analysisResult,
    error,
    selectedPhotos,

    // Actions
    pickImages,
    takePhoto,
    analyzePhotos,
    removePhoto,
    resetAnalysis,
    handleGoBack,
    clearError,
  };
};
