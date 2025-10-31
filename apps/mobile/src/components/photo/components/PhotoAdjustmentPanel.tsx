/**
 * Photo Adjustment Panel Component
 * Adjustment sliders, quick actions, and transform controls
 */
import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { BouncePressable } from '../../micro';
import { PhotoAdjustmentSlider } from '../PhotoAdjustmentSlider';
import type { PhotoAdjustments } from '../types';

interface PhotoAdjustmentPanelProps {
  adjustments: PhotoAdjustments;
  quickMode: string | null;
  showGrid: 'off' | 'thirds' | 'golden';
  onUpdateAdjustment: (key: keyof PhotoAdjustments, value: number) => void;
  onResetAdjustments: () => void;
  onQuickAction: (action: string) => void;
  onToggleGrid: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onUltraExport: () => void;
  ultraExporting: boolean;
  ultraProgress: number;
}

export const PhotoAdjustmentPanel: React.FC<PhotoAdjustmentPanelProps> = ({
  adjustments,
  quickMode,
  showGrid,
  onUpdateAdjustment,
  onResetAdjustments,
  onQuickAction,
  onToggleGrid,
  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,
  onUltraExport,
  ultraExporting,
  ultraProgress,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        contentContainer: {
          flex: 1,
          padding: theme.spacing.md,
        },
        quickAction: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surface,
          marginRight: theme.spacing.sm,
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
          marginTop: theme.spacing.xs,
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
          marginTop: theme.spacing.xs,
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
          gap: theme.spacing.sm,
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
          gap: theme.spacing.sm,
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
      }),
    [theme],
  );

  const quickActions = [
    { key: 'auto', icon: 'sparkles', label: 'Auto' },
    { key: 'portrait', icon: 'person', label: 'Portrait' },
    { key: 'vivid', icon: 'flash', label: 'Vivid+' },
    { key: 'dramatic', icon: 'contrast', label: 'Dramatic' },
  ];

  return (
    <View style={styles.contentContainer}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
            {quickActions.map((action) => (
              <BouncePressable
                key={action.key}
                onPress={() => onQuickAction(action.key)}
                style={[styles.quickAction, quickMode === action.key && styles.quickActionActive]}
              >
                <Ionicons
                  name={action.icon as any}
                  size={16}
                  color={quickMode === action.key ? theme.colors.primary : theme.colors.onMuted}
                />
                <Text
                  style={[
                    styles.quickActionText,
                    quickMode === action.key && { color: theme.colors.primary },
                  ]}
                >
                  {action.label}
                </Text>
              </BouncePressable>
            ))}
          </ScrollView>
          <BouncePressable onPress={onToggleGrid} style={{ padding: theme.spacing.sm }}>
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
            onPress={onRotateLeft}
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
            onPress={onRotateRight}
            style={styles.controlButton}
            accessibilityLabel="Rotate right"
          >
            <Ionicons name="refresh" size={26} color={theme.colors.onSurface} />
            <Text style={styles.controlLabel}>Rotate R</Text>
          </BouncePressable>

          <BouncePressable
            onPress={onFlipHorizontal}
            style={styles.controlButton}
            accessibilityLabel="Flip horizontal"
          >
            <Ionicons name="swap-horizontal" size={26} color={theme.colors.onSurface} />
            <Text style={styles.controlLabel}>Flip H</Text>
          </BouncePressable>

          <BouncePressable
            onPress={onFlipVertical}
            style={styles.controlButton}
            accessibilityLabel="Flip vertical"
          >
            <Ionicons name="swap-vertical" size={26} color={theme.colors.onSurface} />
            <Text style={styles.controlLabel}>Flip V</Text>
          </BouncePressable>
        </View>

        {/* Adjustment Sliders */}
        <BlurView intensity={20} style={styles.slidersPanel}>
          <PhotoAdjustmentSlider
            label="Brightness"
            value={adjustments.brightness}
            min={0}
            max={200}
            step={1}
            defaultValue={100}
            icon="sunny"
            onValueChange={(v) => onUpdateAdjustment('brightness', v)}
          />
          <PhotoAdjustmentSlider
            label="Contrast"
            value={adjustments.contrast}
            min={0}
            max={200}
            step={1}
            defaultValue={100}
            icon="contrast"
            onValueChange={(v) => onUpdateAdjustment('contrast', v)}
          />
          <PhotoAdjustmentSlider
            label="Saturation"
            value={adjustments.saturation}
            min={0}
            max={200}
            step={1}
            defaultValue={100}
            icon="color-palette"
            onValueChange={(v) => onUpdateAdjustment('saturation', v)}
          />
          <PhotoAdjustmentSlider
            label="Warmth"
            value={adjustments.warmth}
            min={-100}
            max={100}
            step={1}
            defaultValue={0}
            icon="flame"
            onValueChange={(v) => onUpdateAdjustment('warmth', v)}
          />
          <PhotoAdjustmentSlider
            label="Blur"
            value={adjustments.blur}
            min={0}
            max={20}
            step={1}
            defaultValue={0}
            icon="water"
            onValueChange={(v) => onUpdateAdjustment('blur', v)}
          />
          <PhotoAdjustmentSlider
            label="Clarity"
            value={adjustments.sharpen}
            min={0}
            max={100}
            step={1}
            defaultValue={0}
            icon="aperture"
            onValueChange={(v) => onUpdateAdjustment('sharpen', v)}
          />

          <View style={{ height: theme.spacing.sm }} />
          <BouncePressable
            onPress={onResetAdjustments}
            style={styles.resetButton}
            scaleFrom={0.95}
            accessibilityLabel="Reset all adjustments"
          >
            <Ionicons name="refresh-circle" size={20} color={theme.colors.danger} />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </BouncePressable>
        </BlurView>

        {/* Ultra Export Button */}
        <View style={{ marginTop: theme.spacing.lg }}>
          <BouncePressable
            onPress={onUltraExport}
            disabled={ultraExporting}
            style={[styles.ultraExportButton, ultraExporting && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Export ultra variants for social media"
          >
            <Ionicons name="rocket" size={24} color={theme.colors.primary} />
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
  );
};

