/**
 * Photo Upload Section Component
 * Displays photo upload interface for AI bio generation
 */

import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface PhotoUploadSectionProps {
  selectedPhoto: string | null;
  onPickImage: () => void;
}

export const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  selectedPhoto,
  onPickImage,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pet Photo (Optional)</Text>
      <TouchableOpacity
        style={styles.photoUpload}
        onPress={onPickImage}
        accessibilityLabel="Upload pet photo"
        accessibilityRole="button"
        testID="photo-upload-button"
      >
        {selectedPhoto ? (
          <Image
            source={{ uri: selectedPhoto }}
            style={styles.selectedPhoto}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons
              name="camera"
              size={40}
              color={theme.colors.onMuted}
            />
            <Text style={styles.photoPlaceholderText}>Add Photo for Better Analysis</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    photoUpload: {
      height: 200,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation2,
    },
    selectedPhoto: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    photoPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    photoPlaceholderText: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
  });
};

