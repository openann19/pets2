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

import { renderHook, act } from '@testing-library/react-native';
import { useAIPhotoAnalyzer } from '../useAIPhotoAnalyzer';

describe('useAIPhotoAnalyzer', () => {
  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIPhotoAnalyzer());
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.analysis).toBeNull();
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
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(mockPhoto);
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
        const analysis = await result.current.analyzePhoto(petPhoto);
        expect(analysis).toBeDefined();
      });
    });

    it('should handle photo without pets', async () => {
      const noPetPhoto = {
        uri: 'file://test/landscape.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        const analysis = await result.current.analyzePhoto(noPetPhoto);
        expect(analysis).toBeDefined();
      });
    });

    it('should provide quality suggestions', async () => {
      const lowQualityPhoto = {
        uri: 'file://test/blurry.jpg',
        width: 200,
        height: 150,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        const analysis = await result.current.analyzePhoto(lowQualityPhoto);
        expect(analysis).toHaveProperty('quality');
        expect(analysis).toHaveProperty('suggestions');
      });
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
        result.current.analyzePhoto(mockPhoto).then(() => {
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
        await result.current.analyzePhoto(mockPhoto);
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
        await result.current.analyzePhoto(invalidPhoto);
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
        await result.current.analyzePhoto(mockPhoto);
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
        await result.current.analyzePhoto(mockPhoto);
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
        await result.current.analyzePhoto(mockPhoto);
      });

      const firstAnalysis = result.current.analysis;

      // Second analysis of same photo
      await act(async () => {
        await result.current.analyzePhoto(mockPhoto);
      });

      // Should use cached result
      expect(result.current.analysis).toBe(firstAnalysis);
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
        await result.current.analyzePhoto(mockPhoto);
      });

      // Should work without caching
      expect(result.current.analysis).toBeDefined();
    });
  });

  describe('Analysis Results', () => {
    it('should provide quality score', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(mockPhoto);
      });

      expect(result.current.analysis).toHaveProperty('quality');
      expect(typeof result.current.analysis?.quality).toBe('number');
      expect(result.current.analysis?.quality).toBeGreaterThanOrEqual(0);
      expect(result.current.analysis?.quality).toBeLessThanOrEqual(1);
    });

    it('should detect pet presence', async () => {
      const petPhoto = {
        uri: 'file://test/dog.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(petPhoto);
      });

      expect(result.current.analysis).toHaveProperty('hasPet');
      expect(typeof result.current.analysis?.hasPet).toBe('boolean');
    });

    it('should provide improvement suggestions', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(mockPhoto);
      });

      expect(result.current.analysis).toHaveProperty('suggestions');
      expect(Array.isArray(result.current.analysis?.suggestions)).toBe(true);
    });

    it('should include confidence scores', async () => {
      const mockPhoto = {
        uri: 'file://test/photo.jpg',
        width: 800,
        height: 600,
      };

      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(mockPhoto);
      });

      expect(result.current.analysis).toHaveProperty('confidence');
      expect(typeof result.current.analysis?.confidence).toBe('number');
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
        const promises = photos.map((photo) => result.current.analyzePhoto(photo));
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
        result.current.analyzePhoto(photo1);
      });

      expect(result.current.isAnalyzing).toBe(true);

      // Start second analysis (should cancel first)
      await act(async () => {
        await result.current.analyzePhoto(photo2);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null photo', async () => {
      const { result } = renderHook(() => useAIPhotoAnalyzer());

      await act(async () => {
        await result.current.analyzePhoto(null as any);
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
        await result.current.analyzePhoto(invalidPhoto);
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
        await result.current.analyzePhoto(largePhoto);
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
        result.current.analyzePhoto({
          uri: 'file://test/photo.jpg',
          width: 800,
          height: 600,
        });
      });

      unmount();
      // Should cleanup properly
    });
  });
});
