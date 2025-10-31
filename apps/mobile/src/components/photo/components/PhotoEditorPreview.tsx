/**
 * Photo Editor Preview Component
 * Handles preview display, zoom, compare, and grid overlays
 */
import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/theme';
import { SmartImage } from '../../common/SmartImage';
import { BouncePressable } from '../../micro';
import type { AnimatedStyle } from 'react-native-reanimated';
import type { GestureType } from 'react-native-gesture-handler';

// Lazy load dimensions to support test mocking
const getDimensions = () => {
  try {
    const dims = Dimensions.get('window');
    return { width: dims?.width ?? 375, height: dims?.height ?? 812 };
  } catch {
    return { width: 375, height: 812 };
  }
};
const { width, height } = getDimensions();
const PREVIEW_HEIGHT = height * 0.5;

interface PhotoEditorPreviewProps {
  originalUri: string;
  editedUri: string;
  activeTab: 'filters' | 'adjust' | 'crop';
  showSplit: boolean;
  showGrid: 'off' | 'thirds' | 'golden';
  comparing: boolean;
  originalOpacity: AnimatedStyle;
  editedOpacity: AnimatedStyle;
  previewTransform: AnimatedStyle;
  pinchZoomGesture: GestureType;
  onCompareIn: () => void;
  onCompareOut: () => void;
  onCancel: () => void;
  onSave: () => void;
  onToggleSplit: () => void;
  isProcessing: boolean;
  children?: React.ReactNode; // For crop UI
}

export const PhotoEditorPreview: React.FC<PhotoEditorPreviewProps> = ({
  originalUri,
  editedUri,
  activeTab,
  showSplit,
  showGrid,
  comparing,
  originalOpacity,
  editedOpacity,
  previewTransform,
  pinchZoomGesture,
  onCompareIn,
  onCompareOut,
  onCancel,
  onSave,
  onToggleSplit,
  isProcessing,
  children,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        previewContainer: {
          height: PREVIEW_HEIGHT,
          backgroundColor: theme.colors.bg,
        },
        previewHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
        headerButton: {
          padding: theme.spacing.sm,
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
          top: theme.spacing.lg,
          left: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
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
      }),
    [theme],
  );

  return (
    <SafeAreaView style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <BouncePressable
          onPress={onCancel}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Close editor"
        >
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </BouncePressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Text style={styles.headerTitle}>Edit Photo</Text>
          {activeTab !== 'crop' && (
            <BouncePressable
              onPress={onToggleSplit}
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
          )}
        </View>

        <BouncePressable
          onPress={onSave}
          disabled={isProcessing}
          style={[styles.headerButton, isProcessing && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Save edits"
        >
          <Text style={styles.saveButton}>{isProcessing ? 'Saving…' : 'Save'}</Text>
        </BouncePressable>
      </View>

      {activeTab === 'crop' ? (
        <View>{children}</View>
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
            <Animated.View style={[StyleSheet.absoluteFill, editedOpacity, previewTransform] as any}>
              <SmartImage source={{ uri: editedUri }} style={styles.previewImage} rounded={0} />
            </Animated.View>

            {/* Original (shown while holding) */}
            <Animated.View style={[StyleSheet.absoluteFill, originalOpacity, previewTransform] as any}>
              <SmartImage source={{ uri: originalUri }} style={styles.previewImage} rounded={0} />
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
  );
};

