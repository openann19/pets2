/**
 * Photo Editor State Hook
 * Centralized state management for photo editor
 */
import { useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import type { CropperHandle } from '../Cropper';
import { AutoCropEngine } from '../../../utils/AutoCropEngine';
import type { PhotoAdjustments, FilterPreset } from '../types';
import { QUICK_ACTION_PRESETS } from '../filterPresets';

export type PhotoEditorTab = 'filters' | 'adjust' | 'crop';

export interface UsePhotoEditorStateOptions {
  onCropped: (uri: string) => void;
  applyFilter: (adjustments: Partial<PhotoAdjustments>) => void;
  editedUri: string;
}

export interface UsePhotoEditorStateReturn {
  activeTab: PhotoEditorTab;
  setActiveTab: (tab: PhotoEditorTab) => void;
  showSplit: boolean;
  setShowSplit: (show: boolean) => void;
  showGrid: 'off' | 'thirds' | 'golden';
  setShowGrid: (grid: 'off' | 'thirds' | 'golden') => void;
  quickMode: string | null;
  showGuides: boolean;
  setShowGuides: (show: boolean) => void;
  showUltraModal: boolean;
  setShowUltraModal: (show: boolean) => void;
  cropperRef: React.RefObject<CropperHandle>;
  handleAutoCrop: () => Promise<void>;
  handleSuggestionApply: (crop: { x: number; y: number; width: number; height: number }) => Promise<void>;
  autoEnhance: () => void;
  batchApply: (preset: string) => void;
  applyFilterPreset: (preset: FilterPreset) => void;
}

export function usePhotoEditorState({
  onCropped,
  applyFilter,
  editedUri,
}: UsePhotoEditorStateOptions): UsePhotoEditorStateReturn {
  const [activeTab, setActiveTab] = useState<PhotoEditorTab>('adjust');
  const [showSplit, setShowSplit] = useState(false);
  const [showGrid, setShowGrid] = useState<'off' | 'thirds' | 'golden'>('off');
  const [quickMode, setQuickMode] = useState<string | null>(null);
  const [showGuides, setShowGuides] = useState(false);
  const [showUltraModal, setShowUltraModal] = useState(false);
  const cropperRef = useRef<CropperHandle>(null);

  const handleAutoCrop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await AutoCropEngine.detect(editedUri);
    if (res?.focus) {
      cropperRef.current?.focusTo(res.focus);
    }
  }, [editedUri]);

  const handleSuggestionApply = useCallback(
    async (crop: { x: number; y: number; width: number; height: number }) => {
      try {
        const newUri = await AutoCropEngine.applyCrop(editedUri, crop, 1);
        onCropped(newUri);
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [editedUri, onCropped],
  );

  const autoEnhance = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    applyFilter({ brightness: 105, contrast: 110, saturation: 115, sharpen: 20 });
    setQuickMode('auto');
    setTimeout(() => {
      setQuickMode(null);
    }, 2000);
  }, [applyFilter]);

  const batchApply = useCallback(
    (preset: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (QUICK_ACTION_PRESETS[preset]) {
        applyFilter(QUICK_ACTION_PRESETS[preset]);
        setQuickMode(preset);
        setTimeout(() => {
          setQuickMode(null);
        }, 2000);
      }
    },
    [applyFilter],
  );

  const applyFilterPreset = useCallback(
    (preset: FilterPreset) => {
      applyFilter(preset.adjustments);
      setActiveTab('adjust');
    },
    [applyFilter],
  );

  return {
    activeTab,
    setActiveTab,
    showSplit,
    setShowSplit,
    showGrid,
    setShowGrid,
    quickMode,
    showGuides,
    setShowGuides,
    showUltraModal,
    setShowUltraModal,
    cropperRef,
    handleAutoCrop,
    handleSuggestionApply,
    autoEnhance,
    batchApply,
    applyFilterPreset,
  };
}

