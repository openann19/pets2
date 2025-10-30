/**
 * useCompatibilityAnalysis Hook
 *
 * Manages compatibility analysis API integration and results.
 * Handles analysis state, API calls, and error handling.
 *
 * @example
 * ```typescript
 * const {
 *   analyzing,
 *   analysisResult,
 *   error,
 *   runAnalysis,
 *   resetResults,
 * } = useCompatibilityAnalysis();
 *
 * await runAnalysis(pet1Id, pet2Id);
 * ```
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { api } from '../../services/api';
import { logger } from '../../services/logger';

export interface AnalysisResult {
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

export interface UseCompatibilityAnalysisReturn {
  /**
   * Whether analysis is currently running
   */
  analyzing: boolean;

  /**
   * Analysis results (null if not yet analyzed or reset)
   */
  analysisResult: AnalysisResult | null;

  /**
   * Error message if analysis failed
   */
  error: string | null;

  /**
   * Run compatibility analysis for two pets
   */
  runAnalysis: (pet1Id: string, pet2Id: string) => Promise<void>;

  /**
   * Reset analysis results
   */
  resetResults: () => void;

  /**
   * Get compatibility label from score
   */
  getCompatibilityLabel: (score: number) => string;
}

/**
 * Manages compatibility analysis state and API integration
 */
export const useCompatibilityAnalysis = (): UseCompatibilityAnalysisReturn => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Run compatibility analysis
   */
  const runAnalysis = useCallback(async (pet1Id: string, pet2Id: string): Promise<void> => {
    setAnalyzing(true);
    setError(null);

    try {
      const result = await api.ai.analyzeCompatibility({
        pet1Id,
        pet2Id,
      });

      setAnalysisResult(result);
      logger.info('Compatibility analysis completed', {
        pet1Id,
        pet2Id,
        score: result.compatibility_score,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Compatibility analysis failed', { error, pet1Id, pet2Id });

      Alert.alert('Analysis Error', 'Failed to analyze pet compatibility. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  /**
   * Reset analysis results
   */
  const resetResults = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  /**
   * Get compatibility label from score
   */
  const getCompatibilityLabel = useCallback((score: number): string => {
    const percentage = score * 100;
    if (percentage >= 90) return 'Excellent Match!';
    if (percentage >= 80) return 'Very Good Match';
    if (percentage >= 70) return 'Good Compatibility';
    if (percentage >= 60) return 'Fair Compatibility';
    return 'Poor Match';
  }, []);

  return {
    analyzing,
    analysisResult,
    error,
    runAnalysis,
    resetResults,
    getCompatibilityLabel,
  };
};
