import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { usePhotoEditor } from '../../hooks/usePhotoEditor';
import {
  usePhotoPinchZoom,
  usePhotoCompare,
  usePhotoFilters,
  useUltraExport,
} from '../../hooks/photo';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { FILTER_PRESETS } from './filterPresets';
import { usePhotoEditorState } from './hooks/usePhotoEditorState';
import {
  PhotoEditorPreview,
  PhotoEditorTabs,
  PhotoAdjustmentPanel,
  PhotoFiltersPanel,
  PhotoCropPanel,
  UltraExportModal,
} from './components';

import type { FilterPreset } from './types';

interface AdvancedPhotoEditorProps {
  imageUri: string;
  onSave: (uri: string) => void;
  onCancel: () => void;
  aspectRatio?: [number, number];
  maxWidth?: number;
  maxHeight?: number;
}

export const AdvancedPhotoEditor: React.FC<AdvancedPhotoEditorProps> = ({
  imageUri,
  onSave,
  onCancel,
  maxWidth = 1920,
  maxHeight = 1920,
}) => {
  const theme = useTheme();
  const [sourceUri, setSourceUri] = useState(imageUri);

  const {
    uri: editedUri,
    isLoading: isProcessing,
    adjustments,
    flipHorizontal,
    flipVertical,
    updateAdjustment,
    setFlipHorizontal,
    setFlipVertical,
    applyFilter,
    resetAdjustments,
    saveImage,
    rotateLeft,
    rotateRight,
  } = usePhotoEditor(sourceUri, { maxWidth, maxHeight });

  // After crop, replace the working uri
  const handleCropped = useCallback(
    (uri: string) => {
      setSourceUri(uri);
    },
    [],
  );

  // Photo editor state management
  const editorState = usePhotoEditorState({
    onCropped: handleCropped,
    applyFilter,
    editedUri,
  });

  // Photo hooks
  const { animatedStyle: previewTransform, gesture: pinchZoomGesture } = usePhotoPinchZoom({
    initialScale: 1,
    minScale: 1,
    maxScale: 4,
    enabled: editorState.activeTab !== 'crop',
  });

  const { comparing, originalOpacity, editedOpacity, onCompareIn, onCompareOut } = usePhotoCompare({
    duration: 160,
  });

  const { applyPreset } = usePhotoFilters({
    onApplyFilter: applyFilter,
    presets: FILTER_PRESETS,
  });

  const {
    isExporting: ultraExporting,
    progress: ultraProgress,
    variants: ultraVariants,
    exportVariants: handleUltraExportInternal,
    saveAll: handleUltraSaveAll,
  } = useUltraExport({
    imageUri: editedUri,
    ratios: ['1:1', '4:5', '9:16'],
    onProgress: (progress, variant) => {
      if (progress === 1 && variant) {
        editorState.setShowUltraModal(true);
      }
    },
  });

  const handleUltraExport = useCallback(async () => {
    await handleUltraExportInternal();
    if (ultraVariants.length > 0) {
      editorState.setShowUltraModal(true);
    }
  }, [handleUltraExportInternal, ultraVariants.length, editorState]);

  const handleFlipH = useCallback(() => {
    setFlipHorizontal(!flipHorizontal);
  }, [flipHorizontal, setFlipHorizontal]);
  const handleFlipV = useCallback(() => {
    setFlipVertical(!flipVertical);
  }, [flipVertical, setFlipVertical]);

  const handleSave = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const savedUri = await saveImage();
    if (savedUri) onSave(savedUri);
  }, [saveImage, onSave]);

  const handleToggleGrid = useCallback(() => {
    editorState.setShowGrid((g: 'off' | 'thirds' | 'golden') => {
      if (g === 'off') return 'thirds';
      if (g === 'thirds') return 'golden';
      return 'off';
    });
  }, [editorState]);

  const handleApplyFilterPreset = useCallback(
    (preset: FilterPreset) => {
      applyPreset(preset);
      editorState.setActiveTab('adjust');
    },
    [applyPreset, editorState],
  );

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        content: {
          flex: 1,
        },
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: theme.colors.surface + 'E0',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        loadingContent: {
          alignItems: 'center' as const,
        },
        loadingText: {
          marginTop: 12,
          fontSize: 16,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      {/* Preview Area */}
      <PhotoEditorPreview
        originalUri={imageUri}
        editedUri={editedUri}
        activeTab={editorState.activeTab}
        showSplit={editorState.showSplit}
        showGrid={editorState.showGrid}
        comparing={comparing}
        originalOpacity={originalOpacity}
        editedOpacity={editedOpacity}
        previewTransform={previewTransform}
        pinchZoomGesture={pinchZoomGesture}
        onCompareIn={onCompareIn}
        onCompareOut={onCompareOut}
        onCancel={onCancel}
        onSave={handleSave}
        onToggleSplit={() => editorState.setShowSplit((s: boolean) => !s)}
        isProcessing={isProcessing}
      >
        {editorState.activeTab === 'crop' && (
          <PhotoCropPanel
            editedUri={editedUri}
            cropperRef={editorState.cropperRef}
            showGuides={editorState.showGuides}
            onAutoCrop={editorState.handleAutoCrop}
            onToggleGuides={() => editorState.setShowGuides((s) => !s)}
            onSuggestionApply={editorState.handleSuggestionApply}
            onCropped={handleCropped}
          />
        )}
      </PhotoEditorPreview>

      {/* Tabs */}
      <PhotoEditorTabs activeTab={editorState.activeTab} onTabChange={editorState.setActiveTab} />

      {/* Content Panels */}
      <View style={styles.content}>
        {editorState.activeTab === 'adjust' && (
          <PhotoAdjustmentPanel
            adjustments={adjustments}
            quickMode={editorState.quickMode}
            showGrid={editorState.showGrid}
            onUpdateAdjustment={updateAdjustment}
            onResetAdjustments={resetAdjustments}
            onQuickAction={(action) => {
              if (action === 'auto') {
                editorState.autoEnhance();
              } else {
                editorState.batchApply(action);
              }
            }}
            onToggleGrid={handleToggleGrid}
            onRotateLeft={rotateLeft}
            onRotateRight={rotateRight}
            onFlipHorizontal={handleFlipH}
            onFlipVertical={handleFlipV}
            onUltraExport={handleUltraExport}
            ultraExporting={ultraExporting}
            ultraProgress={ultraProgress}
          />
        )}

        {editorState.activeTab === 'filters' && (
          <PhotoFiltersPanel onApplyFilter={handleApplyFilterPreset} />
        )}

        {editorState.activeTab === 'crop' && (
          <View style={{ flex: 1 }} />
        )}
      </View>

      {/* Before/After Split View */}
      {editorState.showSplit && (
        <BeforeAfterSlider
          originalUri={imageUri}
          editedUri={editedUri}
          onClose={() => editorState.setShowSplit(false)}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <BlurView intensity={80} style={styles.loadingContent}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Processing…</Text>
          </BlurView>
        </View>
      )}

      {/* Ultra Export Modal */}
      <UltraExportModal
        visible={editorState.showUltraModal}
        variants={ultraVariants}
        onClose={() => editorState.setShowUltraModal(false)}
        onSaveAll={handleUltraSaveAll}
      />
    </View>
  );
};
