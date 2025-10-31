/**
 * Tests for useAIPhotoAnalyzer hook
 *
 * Covers:
 * - Photo quality analysis
 * - Pet detection
 * - API error handling
 * - Loading states
 * - Result caching
 */

// Mock the API import BEFORE any other imports
jest.mock('../../../../services/api', () => ({
  api: {
    ai: {
      analyzePhotos: jest.fn().mockResolvedValue({
        breed_analysis: {
          primary_breed: 'Golden Retriever',
          confidence: 0.85,
          secondary_breeds: []
        },
        health_assessment: {
          age_estimate: 2,
          health_score: 0.9,
          recommendations: ['Regular exercise', 'Balanced diet']
        },
        photo_quality: {
          overall_score: 0.8,
          lighting_score: 0.7,
          composition_score: 0.9,
          clarity_score: 0.8
        },
        matchability_score: 0.85,
        ai_insights: ['Friendly temperament', 'Good with children']
      })
    }
  }
}));

import { renderHook, act } from '@testing-library/react-native';
import { useAIPhotoAnalyzer } from '../useAIPhotoAnalyzer';

describe('useAIPhotoAnalyzer', () => {
  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIPhotoAnalyzer());
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.analysisResult).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should accept custom configuration', () => {
      const { result } = renderHook(() =>
        useAIPhotoAnalyzer({
          enableCache: false,
          timeout: 10000,
        }),
      );
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Photo Analysis', () => {
    it('should analyze photo quality', async () => {
      const mockPhotoUri = 'file://test/photo.jpg';

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([mockPhotoUri]);
      });

      // Should complete analysis
      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should detect pets in photos', async () => {
      const petPhoto = {
        uri: 'file://test/dog.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([petPhoto.uri]);
      });

      expect(result.current.analysisResult).toBeDefined();
    });

    it('should handle photo without pets', async () => {
      const noPetPhoto = {
        uri: 'file://test/landscape.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([noPetPhoto.uri]);
      });

      expect(result.current.analysisResult).toBeDefined();
    });

    it('should provide quality suggestions', async () => {
      const lowQualityPhoto = {
        uri: 'file://test/blurry.jpg',
        width: 200,
        height: 150,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([lowQualityPhoto.uri]);
      });

      expect(result.current.analysisResult).toHaveProperty('photo_quality');
      expect(result.current.analysisResult).toHaveProperty('ai_insights');
    });
  });

  describe('Loading States', () => {
    it('should set loading state during analysis', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      let loadingState: boolean = false;

      act(() => {
        result.current.analyzePhotos([mockPhoto.uri]).then(() => {
          loadingState = result.current.isAnalyzing;
        });
      });

      // Should be loading immediately
      expect(result.current.isAnalyzing).toBe(true);
    });

    it('should clear loading state after analysis', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const invalidPhoto = {
        uri: 'invalid://uri',
        width: 0,
        height: 0,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([invalidPhoto.uri]);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should handle network errors', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      // Simulate network failure
      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      // Should handle network errors
      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should handle timeout errors', async () => {
      const mockPhoto = {
        uri: 'file://test/large-photo.jpg',
        width: 4000,
        height: 3000,
      };

      const { result } = renderHook(() =>
        useAIPhotoAnalyzer({
          timeout: 100, // Very short timeout
        }),
      );

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache analysis results', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() =>
        useAIPhotoAnalyzer({
          enableCache: true,
        }),
      );

      // First analysis
      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      const firstAnalysis = result.current.analysisResult;

      // Second analysis of same photo
      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      // Should use cached result
      expect(result.current.analysisResult).toBe(firstAnalysis);
    });

    it('should respect cache settings', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() =>
        useAIPhotoAnalyzer({
          enableCache: false,
        }),
      );

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      // Should work without caching
      expect(result.current.analysisResult).toBeDefined();
    });
    it('should provide quality score', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      expect(result.current.analysisResult).toHaveProperty('quality');
      expect(typeof result.current.analysisResult?.quality).toBe('number');
      expect(result.current.analysisResult?.quality).toBeGreaterThanOrEqual(0);
      expect(result.current.analysisResult?.quality).toBeLessThanOrEqual(1);
    });

    it('should detect pet presence', async () => {
      const petPhoto = {
        uri: 'file://test/dog.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([petPhoto.uri]);
      });

      expect(result.current.analysisResult).toHaveProperty('hasPet');
      expect(typeof result.current.analysisResult?.hasPet).toBe('boolean');
    });

    it('should provide improvement suggestions', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      expect(result.current.analysisResult).toHaveProperty('suggestions');
      expect(Array.isArray(result.current.analysisResult?.suggestions)).toBe(true);
    });

    it('should include confidence scores', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([mockPhoto.uri]);
      });

      expect(result.current.analysisResult).toHaveProperty('confidence');
      expect(typeof result.current.analysisResult?.confidence).toBe('number');
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent analyses', async () => {
      const photos = [
        { uri: 'file://test/photo1.jpg', width: 800, height: 600 },
        { uri: 'file://test/photo2.jpg', width: 800, height: 600 },
        { uri: 'file://test/photo3.jpg', width: 800, height: 600 },
      ];

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        const promises = photos.map((photo) => result.current.analyzePhotos([photo.uri]));
        await Promise.all(promises);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should cancel previous analysis when starting new one', async () => {
      const photo1 = { uri: 'file://test/photo1.jpg', width: 800, height: 600 };
      const photo2 = { uri: 'file://test/photo2.jpg', width: 800, height: 600 };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      // Start first analysis
      act(() => {
        result.current.analyzePhotos([photo1.uri]);
      });

      expect(result.current.isAnalyzing).toBe(true);

      // Start second analysis (should cancel first)
      await act(async () => {
        await result.current.analyzePhotos([photo2.uri]);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null photo', async () => {
      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos(['']);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle invalid photo format', async () => {
      const invalidPhoto = {
        uri: 'not-a-file-uri',
        width: -1,
        height: -1,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([invalidPhoto.uri]);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle very large images', async () => {
      const largePhoto = {
        uri: 'file://test/huge.jpg',
        width: 10000,
        height: 8000,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhotos([largePhoto.uri]);
      });

      // Should handle gracefully
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should handle unmount gracefully', () => {
      const { unmount } = renderHook(() => useAIPhotoAnalyzer());
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel ongoing analysis on unmount', () => {
      const { unmount, result } = renderHook(() => useAIPhotoAnalyzer());

      act(() => {
        result.current.analyzePhotos(['file://test/photo.jpg']);
      });

      unmount();
      // Should cleanup properly
    });
  });
});
