import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { usePhotoEditor } from '../../hooks/usePhotoEditor';
import {
  usePhotoPinchZoom,
  usePhotoCompare,
  usePhotoFilters,
  useUltraExport,
} from '../../hooks/photo';
import { PhotoAdjustmentSlider } from './PhotoAdjustmentSlider';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BouncePressable } from '../micro';
import { SmartImage } from '../common/SmartImage';
import { Cropper, type CropperHandle } from './Cropper';
import { AutoCropEngine } from '../../utils/AutoCropEngine';
import { SubjectSuggestionsBar } from './SubjectSuggestionsBar';
import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');
const PREVIEW_HEIGHT = height * 0.5;

export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  blur: number;
  sharpen: number;
}

export interface FilterPreset {
  name: string;
  icon: string;
  adjustments: Partial<PhotoAdjustments>;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Original',
    icon: 'ban-outline',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      sharpen: 0,
    },
  },
  {
    name: 'Vivid',
    icon: 'flash',
    adjustments: { brightness: 105, contrast: 110, saturation: 130 },
  },
  { name: 'Warm', icon: 'sunny', adjustments: { warmth: 30, brightness: 105, saturation: 110 } },
  { name: 'Cool', icon: 'snow', adjustments: { warmth: -20, saturation: 90, brightness: 100 } },
  { name: 'B/W', icon: 'contrast', adjustments: { saturation: 0, contrast: 120 } },
  {
    name: 'Vintage',
    icon: 'time',
    adjustments: { saturation: 80, warmth: 20, contrast: 90, brightness: 95 },
  },
  {
    name: 'Dramatic',
    icon: 'cloud',
    adjustments: { contrast: 140, saturation: 120, brightness: 90 },
  },
  { name: 'Soft', icon: 'rainy', adjustments: { contrast: 90, saturation: 95, blur: 5 } },
];

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
  const [activeTab, setActiveTab] = useState<'filters' | 'adjust' | 'crop'>('adjust');
  const [showSplit, setShowSplit] = useState(false);
  const [showGrid, setShowGrid] = useState<'off' | 'thirds' | 'golden'>('off');
  const [quickMode, setQuickMode] = useState<string | null>(null);
  const [sourceUri, setSourceUri] = useState(imageUri);
  const [showGuides, setShowGuides] = useState(false);
  const [showUltraModal, setShowUltraModal] = useState(false);
  const cropperRef = useRef<CropperHandle>(null);

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
  const handleCropped = useCallback((uri: string) => {
    setSourceUri(uri);
    setActiveTab('adjust'); // jump back to adjust if you want
  }, []);

  // Auto-crop handler
  const handleAutoCrop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await AutoCropEngine.detect(editedUri);
    if (res?.focus) {
      cropperRef.current?.focusTo(res.focus);
    }
  }, [editedUri]);

  // Handle suggestion apply - instant crop and return to adjust
  const handleSuggestionApply = useCallback(
    async (crop: { x: number; y: number; width: number; height: number }) => {
      try {
        const newUri = await AutoCropEngine.applyCrop(editedUri, crop, 1);
        handleCropped(newUri); // This will set the new source and bounce back to adjust
      } catch (err) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [editedUri, handleCropped],
  );

  // Photo hooks
  const { animatedStyle: previewTransform, gesture: pinchZoomGesture } = usePhotoPinchZoom({
    initialScale: 1,
    minScale: 1,
    maxScale: 4,
    enabled: activeTab !== 'crop',
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
        // Export complete, show modal
        setShowUltraModal(true);
      }
    },
  });

  const handleUltraExport = useCallback(async () => {
    await handleUltraExportInternal();
    if (ultraVariants.length > 0) {
      setShowUltraModal(true);
    }
  }, [handleUltraExportInternal, ultraVariants.length]);

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

  // Ultra Mode Quick Actions
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
      const presets: Record<string, Partial<PhotoAdjustments>> = {
        portrait: { blur: 2, contrast: 110, saturation: 105 },
        vivid: { brightness: 115, contrast: 120, saturation: 135 },
        film: { contrast: 90, saturation: 95, warmth: 15 },
        dramatic: { contrast: 140, saturation: 120, brightness: 90 },
        dehaze: { brightness: 110, contrast: 105, sharpen: 30 },
        vignette: { contrast: 110, brightness: 95 },
      };
      if (presets[preset]) {
        applyFilter(presets[preset]);
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
      applyPreset(preset);
      setActiveTab('adjust');
    },
    [applyPreset],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        previewContainer: {
          height: PREVIEW_HEIGHT,
          backgroundColor: theme.colors.bg,
        },
        previewHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          paddingHorizontal: 20,
          paddingVertical: 12,
        },
        headerButton: {
          padding: 8,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: 'bold' as const,
          color: theme.colors.onSurface,
        },
        saveButton: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        previewStage: {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          overflow: 'hidden' as const,
        },
        previewImage: {
          width: '100%',
          height: '100%',
        },
        compareBadge: {
          position: 'absolute' as const,
          top: 20,
          left: 20,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: theme.radii.lg,
        },
        compareText: {
          fontSize: 12,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        gridLine: {
          position: 'absolute' as const,
          backgroundColor: theme.colors.onSurface + '40',
          width: 1,
          height: '100%',
        },
        tabBar: {
          flexDirection: 'row' as const,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        tab: {
          flex: 1,
          paddingVertical: 12,
          alignItems: 'center' as const,
        },
        activeTab: {
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary,
        },
        tabText: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        activeTabText: {
          color: theme.colors.primary,
          fontWeight: '600' as const,
        },
        content: {
          flex: 1,
        },
        contentContainer: {
          flex: 1,
          padding: theme.spacing.md,
        },
        quickAction: {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surface,
          marginRight: 8,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
        quickActionActive: {
          backgroundColor: theme.colors.primary + '20',
        },
        quickActionText: {
          fontSize: 12,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginTop: 4,
        },
        controlRow: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
          marginVertical: theme.spacing.md,
        },
        controlButton: {
          alignItems: 'center' as const,
          padding: theme.spacing.sm,
        },
        controlLabel: {
          fontSize: 12,
          color: theme.colors.onMuted,
          marginTop: 4,
        },
        slidersPanel: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.surface + '80',
        },
        resetButton: {
          padding: theme.spacing.md,
          alignItems: 'center' as const,
          flexDirection: 'row' as const,
          justifyContent: 'center' as const,
          gap: 8,
        },
        resetButtonText: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.danger,
        },
        ultraExportButton: {
          padding: theme.spacing.md,
          alignItems: 'center' as const,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.md,
          margin: theme.spacing.md,
          gap: 8,
        },
        ultraExportText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        progressBar: {
          height: 4,
          backgroundColor: theme.colors.border,
          borderRadius: theme.radii.full,
          overflow: 'hidden' as const,
          marginVertical: theme.spacing.sm,
          marginHorizontal: theme.spacing.md,
        },
        progressFill: {
          height: '100%',
          backgroundColor: theme.colors.primary,
        },
        filtersContainer: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          padding: theme.spacing.md,
        },
        filterCard: {
          width: '30%',
          aspectRatio: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          margin: '1.5%',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          padding: theme.spacing.sm,
        },
        filterIcon: {
          marginBottom: theme.spacing.xs,
          borderRadius: theme.radii.full,
          padding: theme.spacing.sm,
        },
        filterName: {
          fontSize: 12,
          color: theme.colors.onSurface,
          textAlign: 'center' as const,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
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
        modalOverlay: {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContainer: {
          backgroundColor: theme.colors.surface,
          margin: 20,
          borderRadius: 16,
          padding: 20,
          maxWidth: 400,
          maxHeight: '80%',
        },
        modalContent: {
          flex: 1,
        },
        modalHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.md,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: 'bold' as const,
          marginBottom: 12,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
        modalScroll: {
          maxHeight: 400,
        },
        modalSubtitle: {
          fontSize: 14,
          color: theme.colors.onMuted,
          marginBottom: theme.spacing.md,
          textAlign: 'center' as const,
        },
        ratioSection: {
          marginBottom: theme.spacing.lg,
        },
        ratioTitle: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        variantGrid: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: theme.spacing.sm,
        },
        variantCard: {
          width: '48%',
          backgroundColor: theme.colors.surfaceAlt || theme.colors.surface,
          borderRadius: theme.radii.md,
          overflow: 'hidden' as const,
          marginBottom: theme.spacing.sm,
        },
        variantImage: {
          width: '100%',
          aspectRatio: 1,
        },
        variantKind: {
          fontSize: 10,
          color: theme.colors.onMuted,
          padding: theme.spacing.xs,
        },
        variantMethod: {
          fontSize: 10,
          color: theme.colors.onMuted,
          paddingHorizontal: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
        },
        modalFooter: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
          marginTop: theme.spacing.md,
        },
        modalButtonContainer: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
        },
        modalButton: {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          minWidth: 100,
        },
        modalButtonSecondary: {
          backgroundColor: theme.colors.surface,
        },
        modalButtonPrimary: {
          backgroundColor: theme.colors.primary,
        },
        modalButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      {/* Preview Area */}
      <SafeAreaView style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <BouncePressable
            onPress={onCancel}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Close editor"
          >
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.onSurface}
            />
          </BouncePressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={styles.headerTitle}>Edit Photo</Text>
            <BouncePressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowSplit((s) => !s);
              }}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Toggle split compare"
            >
              <Ionicons
                name={showSplit ? 'contract-outline' : 'swap-horizontal'}
                size={22}
                color={theme.colors.primary}
              />
            </BouncePressable>
          </View>

          <BouncePressable
            onPress={handleSave}
            disabled={isProcessing}
            style={[styles.headerButton, isProcessing && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Save edits"
          >
            <Text style={styles.saveButton}>{isProcessing ? 'Saving…' : 'Save'}</Text>
          </BouncePressable>
        </View>

        {activeTab === 'crop' ? (
          <View>
            {/* Subject-aware suggestions bar */}
            <SubjectSuggestionsBar
              uri={editedUri}
              ratios={['1:1', '4:5', '9:16']}
              onFocus={(focus) => cropperRef.current?.focusTo(focus)}
              onApply={handleSuggestionApply}
            />

            {/* Quick actions row */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                paddingHorizontal: 16,
                marginBottom: 8,
                justifyContent: 'space-between',
              }}
            >
              <BouncePressable
                onPress={handleAutoCrop}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: 0.8,
                }}
                accessibilityLabel="Auto-crop with face detection"
              >
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onMuted, fontWeight: '700', fontSize: 13 }}>
                  Auto
                </Text>
              </BouncePressable>

              <BouncePressable
                onPress={() => {
                  setShowGuides((s) => !s);
                  Haptics.selectionAsync();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: 0.8,
                }}
                accessibilityLabel="Toggle story mode guides"
              >
                <Ionicons
                  name="eye"
                  size={18}
                  color={showGuides ? theme.colors.primary : theme.colors.onMuted}
                />
                <Text
                  style={{
                    color: showGuides ? theme.colors.primary : theme.colors.onMuted,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  Guides
                </Text>
              </BouncePressable>
            </View>

            <Cropper
              ref={cropperRef}
              uri={editedUri}
              containerW={width}
              containerH={PREVIEW_HEIGHT - 160}
              defaultRatio="4:5"
              onCropped={handleCropped}
              showStoryGuides={showGuides}
            />
          </View>
        ) : (
          <GestureDetector gesture={pinchZoomGesture}>
            <View
              style={styles.previewStage}
              onTouchStart={onCompareIn}
              onTouchEnd={onCompareOut}
              accessible
              accessibilityRole="imagebutton"
              accessibilityHint="Press and hold to compare with original. Pinch to zoom."
            >
              {/* Edited */}
              <Animated.View
                style={[StyleSheet.absoluteFill, editedOpacity, previewTransform] as any}
              >
                <SmartImage
                  source={{ uri: editedUri }}
                  style={styles.previewImage}
                  rounded={0}
                />
              </Animated.View>

              {/* Original (shown while holding) */}
              <Animated.View
                style={[StyleSheet.absoluteFill, originalOpacity, previewTransform] as any}
              >
                <SmartImage
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  rounded={0}
                />
              </Animated.View>

              {comparing && (
                <View style={styles.compareBadge}>
                  <Text style={styles.compareText}>Original</Text>
                </View>
              )}

              {/* Grid Overlay */}
              {showGrid !== 'off' && (
                <View
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  {showGrid === 'thirds' && (
                    <>
                      <View style={[styles.gridLine, { left: '33.33%' }]} />
                      <View style={[styles.gridLine, { left: '66.66%' }]} />
                      <View
                        style={[
                          styles.gridLine,
                          { top: '33.33%', left: 0, width: '100%', height: 1 },
                        ]}
                      />
                      <View
                        style={[
                          styles.gridLine,
                          { top: '66.66%', left: 0, width: '100%', height: 1 },
                        ]}
                      />
                    </>
                  )}
                  {showGrid === 'golden' && (
                    <>
                      <View style={[styles.gridLine, { left: '38.2%' }]} />
                      <View style={[styles.gridLine, { left: '61.8%' }]} />
                      <View
                        style={[
                          styles.gridLine,
                          { top: '38.2%', left: 0, width: '100%', height: 1 },
                        ]}
                      />
                      <View
                        style={[
                          styles.gridLine,
                          { top: '61.8%', left: 0, width: '100%', height: 1 },
                        ]}
                      />
                    </>
                  )}
                </View>
              )}
            </View>
          </GestureDetector>
        )}
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          exiting={FadeOutUp}
        >
          <BouncePressable
            style={[styles.tab, activeTab === 'adjust' && styles.activeTab]}
            onPress={() => {
              setActiveTab('adjust');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'adjust' }}
          >
            <Ionicons
              name="options"
              size={24}
              color={activeTab === 'adjust' ? theme.colors.primary : theme.colors.onMuted}
            />
            <Text style={[styles.tabText, activeTab === 'adjust' && styles.activeTabText]}>
              Adjust
            </Text>
          </BouncePressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          exiting={FadeOutUp}
        >
          <BouncePressable
            style={[styles.tab, activeTab === 'filters' && styles.activeTab]}
            onPress={() => {
              setActiveTab('filters');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'filters' }}
          >
            <Ionicons
              name="sparkles"
              size={24}
              color={activeTab === 'filters' ? theme.colors.primary : theme.colors.onMuted}
            />
            <Text style={[styles.tabText, activeTab === 'filters' && styles.activeTabText]}>
              Filters
            </Text>
          </BouncePressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          exiting={FadeOutUp}
        >
          <BouncePressable
            style={[styles.tab, activeTab === 'crop' && styles.activeTab]}
            onPress={() => {
              setActiveTab('crop');
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'crop' }}
          >
            <Ionicons
              name="crop"
              size={24}
              color={activeTab === 'crop' ? theme.colors.primary : theme.colors.onMuted}
            />
            <Text style={[styles.tabText, activeTab === 'crop' && styles.activeTabText]}>Crop</Text>
          </BouncePressable>
        </Animated.View>
      </View>

      {/* Adjustment Panel */}
      {activeTab === 'adjust' && (
        <View style={styles.contentContainer}>
          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Actions */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <BouncePressable
                  onPress={autoEnhance}
                  style={[styles.quickAction, quickMode === 'auto' && styles.quickActionActive]}
                >
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color={quickMode === 'auto' ? theme.colors.primary : theme.colors.onMuted}
                  />
                  <Text
                    style={[
                      styles.quickActionText,
                      quickMode === 'auto' && { color: theme.colors.primary },
                    ]}
                  >
                    Auto
                  </Text>
                </BouncePressable>
                <BouncePressable
                  onPress={() => {
                    batchApply('portrait');
                  }}
                  style={[styles.quickAction, quickMode === 'portrait' && styles.quickActionActive]}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={quickMode === 'portrait' ? theme.colors.primary : theme.colors.onMuted}
                  />
                  <Text
                    style={[
                      styles.quickActionText,
                      quickMode === 'portrait' && { color: theme.colors.primary },
                    ]}
                  >
                    Portrait
                  </Text>
                </BouncePressable>
                <BouncePressable
                  onPress={() => {
                    batchApply('vivid');
                  }}
                  style={[styles.quickAction, quickMode === 'vivid' && styles.quickActionActive]}
                >
                  <Ionicons
                    name="flash"
                    size={16}
                    color={quickMode === 'vivid' ? theme.colors.primary : theme.colors.onMuted}
                  />
                  <Text
                    style={[
                      styles.quickActionText,
                      quickMode === 'vivid' && { color: theme.colors.primary },
                    ]}
                  >
                    Vivid+
                  </Text>
                </BouncePressable>
                <BouncePressable
                  onPress={() => {
                    batchApply('dramatic');
                  }}
                  style={[styles.quickAction, quickMode === 'dramatic' && styles.quickActionActive]}
                >
                  <Ionicons
                    name="contrast"
                    size={16}
                    color={quickMode === 'dramatic' ? theme.colors.primary : theme.colors.onMuted}
                  />
                  <Text
                    style={[
                      styles.quickActionText,
                      quickMode === 'dramatic' && { color: theme.colors.primary },
                    ]}
                  >
                    Dramatic
                  </Text>
                </BouncePressable>
              </ScrollView>
              <BouncePressable
                onPress={() => {
                  setShowGrid((g) => (g === 'off' ? 'thirds' : g === 'thirds' ? 'golden' : 'off'));
                }}
                style={{ padding: 10 }}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={showGrid === 'off' ? theme.colors.onMuted : theme.colors.primary}
                />
              </BouncePressable>
            </View>

            {/* Transform Controls */}
            <View style={styles.controlRow}>
              <BouncePressable
                onPress={rotateLeft}
                style={styles.controlButton}
                accessibilityLabel="Rotate left"
              >
                <Ionicons
                  name="refresh"
                  size={26}
                  color={theme.colors.onSurface}
                  style={{ transform: [{ scaleX: -1 }] }}
                />
                <Text style={styles.controlLabel}>Rotate L</Text>
              </BouncePressable>

              <BouncePressable
                onPress={rotateRight}
                style={styles.controlButton}
                accessibilityLabel="Rotate right"
              >
                <Ionicons
                  name="refresh"
                  size={26}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.controlLabel}>Rotate R</Text>
              </BouncePressable>

              <BouncePressable
                onPress={handleFlipH}
                style={styles.controlButton}
                accessibilityLabel="Flip horizontal"
              >
                <Ionicons
                  name="swap-horizontal"
                  size={26}
                  color="white"
                />
                <Text style={styles.controlLabel}>Flip H</Text>
              </BouncePressable>

              <BouncePressable
                onPress={handleFlipV}
                style={styles.controlButton}
                accessibilityLabel="Flip vertical"
              >
                <Ionicons
                  name="swap-vertical"
                  size={26}
                  color="white"
                />
                <Text style={styles.controlLabel}>Flip V</Text>
              </BouncePressable>
            </View>

            <BlurView
              intensity={20}
              style={styles.slidersPanel}
            >
              <PhotoAdjustmentSlider
                label="Brightness"
                value={adjustments.brightness}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="sunny"
                onValueChange={(v) => {
                  updateAdjustment('brightness', v);
                }}
              />
              <PhotoAdjustmentSlider
                label="Contrast"
                value={adjustments.contrast}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="contrast"
                onValueChange={(v) => {
                  updateAdjustment('contrast', v);
                }}
              />
              <PhotoAdjustmentSlider
                label="Saturation"
                value={adjustments.saturation}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="color-palette"
                onValueChange={(v) => {
                  updateAdjustment('saturation', v);
                }}
              />
              <PhotoAdjustmentSlider
                label="Warmth"
                value={adjustments.warmth}
                min={-100}
                max={100}
                step={1}
                defaultValue={0}
                icon="flame"
                onValueChange={(v) => {
                  updateAdjustment('warmth', v);
                }}
              />
              <PhotoAdjustmentSlider
                label="Blur"
                value={adjustments.blur}
                min={0}
                max={20}
                step={1}
                defaultValue={0}
                icon="water"
                onValueChange={(v) => {
                  updateAdjustment('blur', v);
                }}
              />
              <PhotoAdjustmentSlider
                label="Clarity"
                value={adjustments.sharpen}
                min={0}
                max={100}
                step={1}
                defaultValue={0}
                icon="aperture"
                onValueChange={(v) => {
                  updateAdjustment('sharpen', v);
                }}
              />

              <View style={{ height: 10 }} />
              <BouncePressable
                onPress={resetAdjustments}
                style={styles.resetButton}
                scaleFrom={0.95}
                accessibilityLabel="Reset all adjustments"
              >
                <Ionicons
                  name="refresh-circle"
                  size={20}
                  color={theme.colors.danger}
                />
                <Text style={styles.resetButtonText}>Reset All</Text>
              </BouncePressable>
            </BlurView>

            {/* Ultra Export Button */}
            <View style={{ marginTop: 24 }}>
              <BouncePressable
                onPress={handleUltraExport}
                disabled={ultraExporting}
                style={[styles.ultraExportButton, ultraExporting && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Export ultra variants for social media"
              >
                <Ionicons
                  name="rocket"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.ultraExportText}>
                  {ultraExporting ? `Exporting... ${ultraProgress}%` : 'ULTRA Export (9 Variants)'}
                </Text>
              </BouncePressable>
              {ultraExporting && (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${ultraProgress}%` }]} />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Filters Panel */}
      {activeTab === 'filters' && (
        <View style={styles.contentContainer}>
          <View style={styles.filtersContainer}>
            {FILTER_PRESETS.map((preset, index) => (
              <Animated.View
                key={preset.name}
                entering={FadeInDown.delay(50 * (index + 1)).springify()}
                exiting={FadeOutUp}
              >
                <BouncePressable
                  style={styles.filterCard}
                  onPress={() => {
                    applyFilterPreset(preset);
                  }}
                  accessibilityLabel={`Apply ${preset.name} filter`}
                >
                  <BlurView
                    intensity={20}
                    style={styles.filterIcon}
                  >
                    <Ionicons
                      name={preset.icon}
                      size={28}
                      color={theme.colors.onSurface}
                    />
                  </BlurView>
                  <Text style={styles.filterName}>{preset.name}</Text>
                </BouncePressable>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      {showSplit && (
        <BeforeAfterSlider
          originalUri={imageUri}
          editedUri={editedUri}
          onClose={() => {
            setShowSplit(false);
          }}
        />
      )}

      {isProcessing && (
        <View
          style={styles.loadingOverlay}
          pointerEvents="none"
        >
          <BlurView
            intensity={80}
            style={styles.loadingContent}
          >
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>Processing…</Text>
          </BlurView>
        </View>
      )}

      {/* Ultra Results Modal */}
      <Modal
        visible={showUltraModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowUltraModal(false);
        }}
      >
        <BlurView
          intensity={80}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Complete</Text>
              <BouncePressable
                onPress={() => {
                  setShowUltraModal(false);
                }}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </BouncePressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalSubtitle}>
                Generated {ultraVariants.length} publish-ready variants
              </Text>

              {/* Group by ratio */}
              {['1:1', '4:5', '9:16'].map((ratio) => {
                const variants = ultraVariants.filter((v) => v.ratio === ratio);
                if (variants.length === 0) return null;

                return (
                  <View
                    key={ratio}
                    style={styles.ratioSection}
                  >
                    <Text style={styles.ratioTitle}>
                      {ratio} (
                      {ratio === '1:1' ? '1080x1080' : ratio === '4:5' ? '1080x1350' : '1080x1920'})
                    </Text>
                    <View style={styles.variantGrid}>
                      {variants.map((variant, idx) => (
                        <View
                          key={idx}
                          style={styles.variantCard}
                        >
                          <SmartImage
                            source={{ uri: variant.outUri }}
                            style={styles.variantImage}
                            rounded={8}
                          />
                          <Text style={styles.variantKind}>{variant.kind}</Text>
                          <Text style={styles.variantMethod}>{variant.method}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <BouncePressable
                onPress={() => {
                  setShowUltraModal(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </BouncePressable>
              <BouncePressable
                onPress={handleUltraSaveAll}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonText}>Save All</Text>
              </BouncePressable>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};
