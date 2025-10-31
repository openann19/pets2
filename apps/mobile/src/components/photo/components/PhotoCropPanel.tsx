/**
 * Photo Crop Panel Component
 * Cropping interface with subject suggestions and guides
 */
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { BouncePressable } from '../../micro';
import { Cropper, type CropperHandle } from '../Cropper';
import { SubjectSuggestionsBar } from '../SubjectSuggestionsBar';
import type { RefObject } from 'react';

const { width, height } = Dimensions.get('window');
const PREVIEW_HEIGHT = height * 0.5;

interface PhotoCropPanelProps {
  editedUri: string;
  cropperRef: RefObject<CropperHandle>;
  showGuides: boolean;
  onAutoCrop: () => Promise<void>;
  onToggleGuides: () => void;
  onSuggestionApply: (crop: { x: number; y: number; width: number; height: number }) => Promise<void>;
  onCropped?: (uri: string) => void;
}

export const PhotoCropPanel: React.FC<PhotoCropPanelProps> = ({
  editedUri,
  cropperRef,
  showGuides,
  onAutoCrop,
  onToggleGuides,
  onSuggestionApply,
  onCropped,
}) => {
  const theme = useTheme();

  return (
    <View>
      {/* Subject-aware suggestions bar */}
      <SubjectSuggestionsBar
        uri={editedUri}
        ratios={['1:1', '4:5', '9:16']}
        onFocus={(focus) => (cropperRef as any).current?.focusTo(focus)}
        onApply={onSuggestionApply}
      />

      {/* Quick actions row */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          justifyContent: 'space-between',
        }}
      >
        <BouncePressable
          onPress={onAutoCrop}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            opacity: 0.8,
          }}
          accessibilityLabel="Auto-crop with face detection"
        >
          <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onMuted, fontWeight: '700', fontSize: 13 }}>Auto</Text>
        </BouncePressable>

        <BouncePressable
          onPress={() => {
            onToggleGuides();
            Haptics.selectionAsync();
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.radii.md,
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
        onCropped={onCropped || (() => {})}
        showStoryGuides={showGuides}
      />
    </View>
  );
};

