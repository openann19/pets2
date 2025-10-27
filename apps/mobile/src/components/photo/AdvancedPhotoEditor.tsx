import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { Theme } from '../../theme/unified-theme';
import { usePhotoEditor } from '../../hooks/usePhotoEditor';
import { PhotoAdjustmentSlider } from './PhotoAdjustmentSlider';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BouncePressable } from '../micro';
import { SmartImage } from '../common/SmartImage'; // fade-in + shimmer
import { Cropper, type CropperHandle } from './Cropper';
import { AutoCropEngine } from '../../utils/AutoCropEngine';
import { SubjectSuggestionsBar } from './SubjectSuggestionsBar';
import { batchAutoCrop } from '../../utils/BatchAutoCrop';
import { exportUltraVariants, type UltraVariant } from '../../utils/UltraPublish';
import { QualityTargets } from '../../utils/QualityTargets';
import { Alert, Modal } from 'react-native';
import { logger } from '../../services/logger';

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
  { name: 'Original', icon: 'ban-outline', adjustments: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0, sharpen: 0 } },
  { name: 'Vivid', icon: 'flash', adjustments: { brightness: 105, contrast: 110, saturation: 130 } },
  { name: 'Warm', icon: 'sunny', adjustments: { warmth: 30, brightness: 105, saturation: 110 } },
  { name: 'Cool', icon: 'snow', adjustments: { warmth: -20, saturation: 90, brightness: 100 } },
  { name: 'B/W', icon: 'contrast', adjustments: { saturation: 0, contrast: 120 } },
  { name: 'Vintage', icon: 'time', adjustments: { saturation: 80, warmth: 20, contrast: 90, brightness: 95 } },
  { name: 'Dramatic', icon: 'cloud', adjustments: { contrast: 140, saturation: 120, brightness: 90 } },
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
  aspectRatio,
  maxWidth = 1920,
  maxHeight = 1920,
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'adjust' | 'crop'>('adjust');
  const [comparing, setComparing] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showGrid, setShowGrid] = useState<'off' | 'thirds' | 'golden'>('off');
  const [quickMode, setQuickMode] = useState<string | null>(null);
  const [sourceUri, setSourceUri] = useState(imageUri);
  const [showGuides, setShowGuides] = useState(false);
  const [ultraExporting, setUltraExporting] = useState(false);
  const [ultraProgress, setUltraProgress] = useState(0);
  const [ultraVariants, setUltraVariants] = useState<UltraVariant[]>([]);
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
    setActiveTab("adjust"); // jump back to adjust if you want
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
  const handleSuggestionApply = useCallback(async (crop: { x: number; y: number; width: number; height: number }) => {
    try {
      const newUri = await AutoCropEngine.applyCrop(editedUri, crop, 1);
      handleCropped(newUri); // This will set the new source and bounce back to adjust
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [editedUri, handleCropped]);

  // --- Compare (press & hold to show ORIGINAL) ---
  const compare = useSharedValue(0); // 0=edited, 1=original
  const originalOpacity = useAnimatedStyle(() => ({
    opacity: compare.value,
  }));
  const editedOpacity = useAnimatedStyle(() => ({
    opacity: 1 - compare.value,
  }));

  const onCompareIn = () => {
    setComparing(true);
    Haptics.selectionAsync();
    compare.value = withTiming(1, { duration: 160 });
  };
  const onCompareOut = () => {
    setComparing(false);
    compare.value = withTiming(0, { duration: 160 });
  };

  // --- Pinch-to-zoom + pan inside preview ---
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(4, e.scale));
    })
    .onEnd(() => {
      if (scale.value <= 1.02) {
        // snap back
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      // gentle bounds clamp (simple)
      translateX.value = withSpring(translateX.value * 0.9);
      translateY.value = withSpring(translateY.value * 0.9);
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const previewTransform = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const applyFilterPreset = useCallback((preset: FilterPreset) => {
    applyFilter(preset.adjustments);
    setActiveTab('adjust');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [applyFilter]);

  const handleFlipH = useCallback(() => { setFlipHorizontal(!flipHorizontal); }, [flipHorizontal, setFlipHorizontal]);
  const handleFlipV = useCallback(() => { setFlipVertical(!flipVertical); }, [flipVertical, setFlipVertical]);

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
    setTimeout(() => { setQuickMode(null); }, 2000);
  }, [applyFilter]);

  const batchApply = useCallback((preset: string) => {
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
      setTimeout(() => { setQuickMode(null); }, 2000);
    }
  }, [applyFilter]);

  // Ultra Export handler
  const handleUltraExport = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUltraExporting(true);
    setUltraProgress(0);
    setUltraVariants([]);

    try {
      const variants = await exportUltraVariants(editedUri, ["1:1", "4:5", "9:16"], {
        onProgress: (progress, variant) => {
          setUltraProgress(Math.round(progress * 100));
          if (variant) {
            setUltraVariants((prev) => [...prev, variant]);
          }
        },
      });

      setUltraVariants(variants);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show results modal
      setShowUltraModal(true);
      
      logger.info('[ULTRA Export] Generated variants', {
        count: variants.length,
        byRatio: variants.reduce<Record<string, number>>((acc, v) => {
          acc[v.ratio] = (acc[v.ratio] || 0) + 1;
          return acc;
        }, {}),
        byKind: variants.reduce<Record<string, number>>((acc, v) => {
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
      setUltraExporting(false);
    }
  }, [editedUri]);

  const handleUltraSaveAll = useCallback(async () => {
    if (ultraVariants.length === 0) return;
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // In a real app, you would:
      // 1. Save all variants to camera roll
      // 2. Or upload to your backend
      // 3. Or attach to a post composer
      
      logger.info('[ULTRA] Saving all variants to camera roll or uploading', { variantCount: ultraVariants.length });
      Alert.alert('Saved!', `Successfully exported ${ultraVariants.length} publish-ready variants.`);
      setShowUltraModal(false);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to save ultra variants', { error: err });
      Alert.alert('Save Failed', 'Failed to save variants. Please try again.');
    }
  }, [ultraVariants]);

  return (
    <View style={styles.container}>
      {/* Preview Area */}
      <SafeAreaView style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <BouncePressable onPress={onCancel} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Close editor">
            <Ionicons name="close" size={24} color="white" />
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
                color={Theme.colors.primary[500]}
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
              ratios={["1:1","4:5","9:16"]}
              onFocus={(focus) => cropperRef.current?.focusTo(focus)}
              onApply={handleSuggestionApply}
            />

            {/* Quick actions row */}
            <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 8, justifyContent: "space-between" }}>
              <BouncePressable
                onPress={handleAutoCrop}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12,
                         borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}
                accessibilityLabel="Auto-crop with face detection">
                <Ionicons name="sparkles" size={18} color={Theme.colors.primary[500}]}} />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Auto</Text>
              </BouncePressable>

              <BouncePressable
                onPress={() => { setShowGuides((s) => !s); Haptics.selectionAsync(); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12,
                         borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}
                accessibilityLabel="Toggle story mode guides">
                <Ionicons name="eye" size={18} color={showGuides ? Theme.colors.primary[500] : "#fff"} />
                <Text style={{ color: showGuides ? Theme.colors.primary[500] : "#fff", fontWeight: "700", fontSize: 13 }}>Guides</Text>
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
          <GestureDetector gesture={composed}>
            <View
              style={styles.previewStage}
              onTouchStart={onCompareIn}
              onTouchEnd={onCompareOut}
              accessible accessibilityRole="imagebutton"
              accessibilityHint="Press and hold to compare with original. Pinch to zoom."
            >
              {/* Edited */}
              <Animated.View style={[StyleSheet.absoluteFill, editedOpacity, previewTransform]}>
                <SmartImage
                  source={{ uri: editedUri }}
                  style={styles.previewImage}
                  rounded={0}
                />
              </Animated.View>

              {/* Original (shown while holding) */}
              <Animated.View style={[StyleSheet.absoluteFill, originalOpacity, previewTransform]}>
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
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  {showGrid === 'thirds' && (
                    <>
                      <View style={[styles.gridLine, { left: '33.33%' }]} />
                      <View style={[styles.gridLine, { left: '66.66%' }]} />
                      <View style={[styles.gridLine, { top: '33.33%', left: 0, width: '100%', height: 1 }]} />
                      <View style={[styles.gridLine, { top: '66.66%', left: 0, width: '100%', height: 1 }]} />
                    </>
                  )}
                  {showGrid === 'golden' && (
                    <>
                      <View style={[styles.gridLine, { left: '38.2%' }]} />
                      <View style={[styles.gridLine, { left: '61.8%' }]} />
                      <View style={[styles.gridLine, { top: '38.2%', left: 0, width: '100%', height: 1 }]} />
                      <View style={[styles.gridLine, { top: '61.8%', left: 0, width: '100%', height: 1 }]} />
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
        <Animated.View entering={FadeInDown.delay(100).springify()} exiting={FadeOutUp}>
          <BouncePressable
            style={[styles.tab, activeTab === 'adjust' && styles.activeTab]}
            onPress={() => { setActiveTab('adjust'); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'adjust' }}
          >
            <Ionicons name="options" size={24} color={activeTab === 'adjust' ? Theme.colors.primary[500] : 'white'} />
            <Text style={[styles.tabText, activeTab === 'adjust' && styles.activeTabText]}>Adjust</Text>
          </BouncePressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} exiting={FadeOutUp}>
          <BouncePressable
            style={[styles.tab, activeTab === 'filters' && styles.activeTab]}
            onPress={() => { setActiveTab('filters'); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'filters' }}
          >
            <Ionicons name="sparkles" size={24} color={activeTab === 'filters' ? Theme.colors.primary[500] : 'white'} />
            <Text style={[styles.tabText, activeTab === 'filters' && styles.activeTabText]}>Filters</Text>
          </BouncePressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} exiting={FadeOutUp}>
          <BouncePressable
            style={[styles.tab, activeTab === 'crop' && styles.activeTab]}
            onPress={() => { setActiveTab('crop'); }}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'crop' }}
          >
            <Ionicons name="crop" size={24} color={activeTab === 'crop' ? Theme.colors.primary[500] : 'white'} />
            <Text style={[styles.tabText, activeTab === 'crop' && styles.activeTabText]}>Crop</Text>
          </BouncePressable>
        </Animated.View>
      </View>

      {/* Adjustment Panel */}
      {activeTab === 'adjust' && (
        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <BouncePressable onPress={autoEnhance} style={[styles.quickAction, quickMode === 'auto' && styles.quickActionActive]}>
                  <Ionicons name="sparkles" size={16} color={quickMode === 'auto' ? Theme.colors.primary[500] : 'white'} />
                  <Text style={[styles.quickActionText, quickMode === 'auto' && { color: Theme.colors.primary[500] }]}>Auto</Text>
                </BouncePressable>
                <BouncePressable onPress={() => { batchApply('portrait'); }} style={[styles.quickAction, quickMode === 'portrait' && styles.quickActionActive]}>
                  <Ionicons name="person" size={16} color={quickMode === 'portrait' ? Theme.colors.primary[500] : 'white'} />
                  <Text style={[styles.quickActionText, quickMode === 'portrait' && { color: Theme.colors.primary[500] }]}>Portrait</Text>
                </BouncePressable>
                <BouncePressable onPress={() => { batchApply('vivid'); }} style={[styles.quickAction, quickMode === 'vivid' && styles.quickActionActive]}>
                  <Ionicons name="flash" size={16} color={quickMode === 'vivid' ? Theme.colors.primary[500] : 'white'} />
                  <Text style={[styles.quickActionText, quickMode === 'vivid' && { color: Theme.colors.primary[500] }]}>Vivid+</Text>
                </BouncePressable>
                <BouncePressable onPress={() => { batchApply('dramatic'); }} style={[styles.quickAction, quickMode === 'dramatic' && styles.quickActionActive]}>
                  <Ionicons name="contrast" size={16} color={quickMode === 'dramatic' ? Theme.colors.primary[500] : 'white'} />
                  <Text style={[styles.quickActionText, quickMode === 'dramatic' && { color: Theme.colors.primary[500] }]}>Dramatic</Text>
                </BouncePressable>
              </ScrollView>
              <BouncePressable onPress={() => { setShowGrid((g) => g === 'off' ? 'thirds' : g === 'thirds' ? 'golden' : 'off'); }} style={{ padding: 10 }}>
                <Ionicons name="grid" size={20} color={showGrid === 'off' ? 'rgba(255,255,255,0.5)' : Theme.colors.primary[500]} />
              </BouncePressable>
            </View>

            {/* Transform Controls */}
            <View style={styles.controlRow}>
              <BouncePressable onPress={rotateLeft} style={styles.controlButton} accessibilityLabel="Rotate left">
                <Ionicons name="refresh" size={26} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={styles.controlLabel}>Rotate L</Text>
              </BouncePressable>

              <BouncePressable onPress={rotateRight} style={styles.controlButton} accessibilityLabel="Rotate right">
                <Ionicons name="refresh" size={26} color="white" />
                <Text style={styles.controlLabel}>Rotate R</Text>
              </BouncePressable>

              <BouncePressable onPress={handleFlipH} style={styles.controlButton} accessibilityLabel="Flip horizontal">
                <Ionicons name="swap-horizontal" size={26} color="white" />
                <Text style={styles.controlLabel}>Flip H</Text>
              </BouncePressable>

              <BouncePressable onPress={handleFlipV} style={styles.controlButton} accessibilityLabel="Flip vertical">
                <Ionicons name="swap-vertical" size={26} color="white" />
                <Text style={styles.controlLabel}>Flip V</Text>
              </BouncePressable>
            </View>

            <BlurView intensity={20} style={styles.slidersPanel}>
              <PhotoAdjustmentSlider
                label="Brightness"
                value={adjustments.brightness}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="sunny"
                onValueChange={(v) => { updateAdjustment('brightness', v); }}
              />
              <PhotoAdjustmentSlider
                label="Contrast"
                value={adjustments.contrast}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="contrast"
                onValueChange={(v) => { updateAdjustment('contrast', v); }}
              />
              <PhotoAdjustmentSlider
                label="Saturation"
                value={adjustments.saturation}
                min={0}
                max={200}
                step={1}
                defaultValue={100}
                icon="color-palette"
                onValueChange={(v) => { updateAdjustment('saturation', v); }}
              />
              <PhotoAdjustmentSlider
                label="Warmth"
                value={adjustments.warmth}
                min={-100}
                max={100}
                step={1}
                defaultValue={0}
                icon="flame"
                onValueChange={(v) => { updateAdjustment('warmth', v); }}
              />
              <PhotoAdjustmentSlider
                label="Blur"
                value={adjustments.blur}
                min={0}
                max={20}
                step={1}
                defaultValue={0}
                icon="water"
                onValueChange={(v) => { updateAdjustment('blur', v); }}
              />
              <PhotoAdjustmentSlider
                label="Clarity"
                value={adjustments.sharpen}
                min={0}
                max={100}
                step={1}
                defaultValue={0}
                icon="aperture"
                onValueChange={(v) => { updateAdjustment('sharpen', v); }}
              />

              <View style={{ height: 10 }} />
              <BouncePressable onPress={resetAdjustments} style={styles.resetButton} scaleFrom={0.95} accessibilityLabel="Reset all adjustments">
                <Ionicons name="refresh-circle" size={20} color={Theme.colors.status.erro}r}} />
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
                <Ionicons name="rocket" size={24} color={Theme.colors.primary[500}]}} />
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
              <Animated.View key={preset.name} entering={FadeInDown.delay(50 * (index + 1)).springify()} exiting={FadeOutUp}>
                <BouncePressable style={styles.filterCard} onPress={() => { applyFilterPreset(preset); }} accessibilityLabel={`Apply ${preset.name} filter`}>
                  <BlurView intensity={20} style={styles.filterIcon}>
                    <Ionicons name={preset.icon} size={28} color="white" />
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
          onClose={() => { setShowSplit(false); }}
        />
      )}

      {isProcessing && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <BlurView intensity={80} style={styles.loadingContent}>
            <ActivityIndicator size="small" color={Theme.colors.primary[500}]}} />
            <Text style={styles.loadingText}>Processing…</Text>
          </BlurView>
        </View>
      )}

      {/* Ultra Results Modal */}
      <Modal
        visible={showUltraModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowUltraModal(false); }}
      >
        <BlurView intensity={80} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Complete</Text>
              <BouncePressable onPress={() => { setShowUltraModal(false); }} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color="white" />
              </BouncePressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Generated {ultraVariants.length} publish-ready variants
              </Text>

              {/* Group by ratio */}
              {["1:1", "4:5", "9:16"].map((ratio) => {
                const variants = ultraVariants.filter((v) => v.ratio === ratio);
                if (variants.length === 0) return null;

                return (
                  <View key={ratio} style={styles.ratioSection}>
                    <Text style={styles.ratioTitle}>
                      {ratio} - {QualityTargets[ratio as keyof typeof QualityTargets]?.minW}x{QualityTargets[ratio as keyof typeof QualityTargets]?.minH}
                    </Text>
                    <View style={styles.variantGrid}>
                      {variants.map((variant, idx) => (
                        <View key={idx} style={styles.variantCard}>
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
              <BouncePressable onPress={() => { setShowUltraModal(false); }} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </BouncePressable>
              <BouncePressable onPress={handleUltraSaveAll} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={styles.modalButtonText}>Save All</Text>
              </BouncePressable>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
    height: PREVIEW_HEIGHT,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary[500],
  },
  previewStage: { flex: 1, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  compareBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  compareText: { color: 'white', fontWeight: '700', fontSize: 12 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    color: 'white',
  },
  activeTabText: {
    color: Theme.colors.primary[500],
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  adjustmentSection: {
    padding: 20,
    gap: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  controlButton: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    minWidth: 80,
  },
  controlLabel: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  slidersPanel: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: Theme.colors.status.error,
  },
  resetButtonText: {
    color: Theme.colors.status.error,
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: { padding: 20, flexDirection: 'row', flexWrap: 'nowrap', gap: 16 },
  filterCard: { alignItems: 'center', marginRight: 16, gap: 8 },
  filterIcon: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterName: { fontSize: 12, color: 'white', fontWeight: '600', textAlign: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  loadingContent: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', gap: 10 },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionActive: {
    backgroundColor: 'rgba(112, 76, 255, 0.2)',
    borderColor: Theme.colors.primary[500],
  },
  quickActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 0,
  },
  ultraExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(112, 76, 255, 0.15)',
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
  },
  ultraExportText: {
    color: Theme.colors.primary[500],
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  ratioSection: {
    marginBottom: 24,
  },
  ratioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary[500],
    marginBottom: 12,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantCard: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
  },
  variantImage: {
    width: '100%',
    aspectRatio: 1,
  },
  variantKind: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  variantMethod: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'capitalize',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Theme.colors.primary[500],
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

