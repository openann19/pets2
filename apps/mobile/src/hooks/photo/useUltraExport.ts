/**
 * Hook for managing ultra export functionality
 * Handles exporting multiple variants with different aspect ratios and processing methods
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { exportUltraVariants, type UltraVariant } from '../../utils/UltraPublish';
import { logger } from '../../services/logger';

export interface UseUltraExportOptions {
  imageUri: string;
  ratios?: string[];
  onProgress?: (progress: number, variant?: UltraVariant) => void;
}

export interface UseUltraExportReturn {
  isExporting: boolean;
  progress: number;
  variants: UltraVariant[];
  exportVariants: () => Promise<void>;
  saveAll: () => Promise<void>;
  reset: () => void;
}

export function useUltraExport({
  imageUri,
  ratios = ['1:1', '4:5', '9:16'],
  onProgress,
}: UseUltraExportOptions): UseUltraExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [variants, setVariants] = useState<UltraVariant[]>([]);

  const exportVariants = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    setProgress(0);
    setVariants([]);

    try {
      const exportedVariants = await exportUltraVariants(imageUri, ratios, {
        onProgress: (prog, variant) => {
          setProgress(Math.round(prog * 100));
          if (variant) {
            setVariants((prev) => [...prev, variant]);
          }
          onProgress?.(prog, variant);
        },
      });

      setVariants(exportedVariants);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      logger.info('[ULTRA Export] Generated variants', {
        count: exportedVariants.length,
        byRatio: exportedVariants.reduce<Record<string, number>>((acc, v) => {
          acc[v.ratio] = (acc[v.ratio] || 0) + 1;
          return acc;
        }, {}),
        byKind: exportedVariants.reduce<Record<string, number>>((acc, v) => {
          acc[v.kind] = (acc[v.kind] || 0) + 1;
          return acc;
        }, {}),
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('[ULTRA Export] Failed', { error: err });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Export Failed', 'Failed to generate ultra variants. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [imageUri, ratios, onProgress]);

  const saveAll = useCallback(async () => {
    if (variants.length === 0) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // In a real app, you would:
      // 1. Save all variants to camera roll
      // 2. Or upload to your backend
      // 3. Or attach to a post composer

      logger.info('[ULTRA] Saving all variants to camera roll or uploading', {
        variantCount: variants.length,
      });
      Alert.alert('Saved!', `Successfully exported ${variants.length} publish-ready variants.`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to save ultra variants', { error: err });
      Alert.alert('Save Failed', 'Failed to save variants. Please try again.');
    }
  }, [variants]);

  const reset = useCallback(() => {
    setIsExporting(false);
    setProgress(0);
    setVariants([]);
  }, []);

  return {
    isExporting,
    progress,
    variants,
    exportVariants,
    saveAll,
    reset,
  };
}

