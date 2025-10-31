/**
 * Upload Card Component
 * Displays individual upload in grid view
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { Upload } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2;

interface UploadCardProps {
  upload: Upload;
  onPress: () => void;
}

const getStatusColor = (status: Upload['status'], theme: AppTheme): string => {
  switch (status) {
    case 'approved':
      return theme.colors.success;
    case 'rejected':
      return theme.colors.danger;
    case 'pending':
      return theme.colors.warning;
    default:
      return theme.colors.border;
  }
};

export const UploadCard = ({ upload, onPress }: UploadCardProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <TouchableOpacity
      style={styles.card}
      testID={`UploadCard-${upload.id}`}
      accessibilityLabel={`View upload details for ${upload.userName}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <Image
        source={{ uri: upload.thumbnailUrl || upload.url }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        {upload.flagged ? (
          <View style={[styles.flagBadge, { backgroundColor: theme.colors.danger }]}>
            <Ionicons
              name="flag"
              size={12}
              color={theme.colors.onPrimary}
            />
          </View>
        ) : null}

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(upload.status, theme) },
          ]}
        >
          <Text style={styles.statusText}>{upload.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.userName, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {upload.userName}
        </Text>
        <Text style={[styles.uploadType, { color: theme.colors.onMuted }]}>
          {upload.type} • {new Date(upload.uploadedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      width: IMAGE_SIZE,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      ...theme.shadows.elevation2,
    },
    image: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
    },
    overlay: {
      position: 'absolute',
      top: theme.spacing.sm,
      start: theme.spacing.sm,
      end: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    flagBadge: {
      width: 24,
      height: 24,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    statusText: {
      fontSize: theme.typography.body.size * 0.625,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
    info: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    userName: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    uploadType: {
      fontSize: theme.typography.body.size * 0.75,
    },
  });

