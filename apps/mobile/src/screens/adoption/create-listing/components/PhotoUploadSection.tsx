/**
 * Photo Upload Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface PhotoUploadSectionProps {
  photos: string[];
  isUploading: boolean;
  onAddPhoto: () => void;
}

export const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  photos,
  isUploading,
  onAddPhoto,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Photos *</Text>
      <BlurView intensity={20} style={[styles.sectionCard, { borderRadius: theme.radii.md }]}>
        <TouchableOpacity
          style={styles.photoUpload}
          onPress={onAddPhoto}
          disabled={isUploading}
          testID="photo-upload-button"
          accessibilityLabel="Add photos"
          accessibilityRole="button"
          accessibilityState={{ disabled: isUploading }}
        >
          <LinearGradient
            colors={[colors.surface, colors.surface]}
            style={styles.photoUploadGradient}
          >
            <Ionicons
              name="camera"
              size={32}
              color={colors.onMuted}
            />
            <Text style={[styles.photoUploadText, { color: colors.onSurface }]}>Add Photos</Text>
            <Text style={[styles.photoUploadHint, { color: colors.onMuted }]}>
              Tap to upload pet photos
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {photos.length > 0 && (
          <View style={[styles.photoPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.photoCount, { color: colors.onSurface }]}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </BlurView>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    photoUpload: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    photoUploadGradient: {
      padding: theme.spacing['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoUploadText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
    },
    photoUploadHint: {
      fontSize: 14,
      marginTop: theme.spacing.xs,
    },
    photoPreview: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
    },
    photoCount: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

