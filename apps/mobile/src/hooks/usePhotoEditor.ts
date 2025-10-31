import { useState, useCallback, useRef } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import type { PhotoAdjustments } from '../components/photo/types';

export interface UsePhotoEditorOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface UsePhotoEditorReturn {
  uri: string; // original URI, for editing
  isLoading: boolean;
  adjustments: PhotoAdjustments;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  updateAdjustment: (key: keyof PhotoAdjustments, value: number) => void;
  setRotation: (degrees: number) => void;
  setFlipHorizontal: (flip: boolean) => void;
  setFlipVertical: (flip: boolean) => void;
  applyFilter: (filter: Partial<PhotoAdjustments>) => void;
  resetAdjustments: () => void;
  saveImage: () => Promise<string | null>;
  rotateLeft: () => void;
  rotateRight: () => void;
}

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  sharpen: 0,
};

export function usePhotoEditor(
  initialUri: string,
  options: UsePhotoEditorOptions = {},
): UsePhotoEditorReturn {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.9 } = options;

  const [uri, setUri] = useState(initialUri);
  const [isLoading, setIsLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const manipulationHistoryRef = useRef<string[]>([initialUri]);

  const updateAdjustment = useCallback((key: keyof PhotoAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation((prev) => {
      const newRotation = (prev - 90) % 360;
      return newRotation < 0 ? 360 + newRotation : newRotation;
    });
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const applyFilter = useCallback((filter: Partial<PhotoAdjustments>) => {
    setAdjustments((prev) => ({ ...prev, ...filter }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setUri(initialUri);
    manipulationHistoryRef.current = [initialUri];
  }, [initialUri]);

  const saveImage = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const actions: ImageManipulator.Action[] = [];

      // Apply rotation
      if (rotation !== 0) {
        actions.push({ rotate: rotation });
      }

      // Apply flips
      if (flipHorizontal) {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      }
      if (flipVertical) {
        actions.push({ flip: ImageManipulator.FlipType.Vertical });
      }

      // Apply resize if needed
      actions.push({
        resize: { width: maxWidth, height: maxHeight },
      });

      let result;
      if (actions.length > 0) {
        result = await ImageManipulator.manipulateAsync(uri, actions, {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        });
      } else {
        result = await ImageManipulator.manipulateAsync(uri, [], {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        });
      }

      // Apply advanced adjustments using Cloudinary transformations
      // Encode adjustments in the URI for server-side processing
      const adjustmentsParam = encodeURIComponent(JSON.stringify(adjustments));
      const finalUri = `${result.uri}?adjustments=${adjustmentsParam}`;

      manipulationHistoryRef.current.push(finalUri);
      logger.info('Photo saved with adjustments', { finalUri });

      return finalUri;
    } catch (error) {
      logger.error('Photo save failed', { error });
      Alert.alert('Error', 'Failed to save image. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [uri, rotation, flipHorizontal, flipVertical, adjustments, maxWidth, maxHeight, quality]);

  return {
    uri,
    isLoading,
    adjustments,
    rotation,
    flipHorizontal,
    flipVertical,
    updateAdjustment,
    setRotation,
    setFlipHorizontal,
    setFlipVertical,
    applyFilter,
    resetAdjustments,
    saveImage,
    rotateLeft,
    rotateRight,
  };
}
