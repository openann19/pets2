/**
 * Attachment Preview Component
 * Displays preview of attachments before sending
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getExtendedColors } from '../../theme/adapters';

export interface AttachmentPreviewProps {
  uri: string;
  type: 'image' | 'video' | 'file';
  name?: string;
  size?: number;
  onRemove: () => void;
  uploading?: boolean;
}

export function AttachmentPreview({
  uri,
  type,
  name,
  size,
  onRemove,
  uploading = false,
}: AttachmentPreviewProps): JSX.Element {
  const theme = useTheme() as AppTheme;
  const colors = getExtendedColors(theme);
  const styles = makeStyles(theme);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'file':
      default:
        return 'document';
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${type} attachment${name ? `: ${name}` : ''}${size ? `, ${formatFileSize(size)}` : ''}`}
      accessibilityState={{ busy: uploading }}
    >
      <View style={StyleSheet.flatten([styles.preview, { backgroundColor: colors.bg }])}>
        {type === 'image' && (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={name || 'Image attachment'}
          />
        )}

        {type !== 'image' && (
          <View style={styles.fileIcon}>
            <Ionicons
              name={getFileIcon(type)}
              size={40}
              color={colors.primary}
            />
          </View>
        )}

        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove attachment"
          accessibilityHint="Tap to remove this attachment"
          hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>

      {name && (
        <Text style={StyleSheet.flatten([styles.fileName, { color: colors.onMuted }])} allowFontScaling>
          {name}
        </Text>
      )}

      {size && (
        <Text style={StyleSheet.flatten([styles.fileSize, { color: colors.onMuted }])} allowFontScaling>
          {formatFileSize(size)}
        </Text>
      )}
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    preview: {
      width: 100,
      height: 100,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fileIcon: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.05),
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.6),
      borderRadius: theme.radii.md,
    },
    fileName: {
      fontSize: 12,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    fileSize: {
      fontSize: 10,
      marginTop: 2,
      textAlign: 'center',
    },
  });
