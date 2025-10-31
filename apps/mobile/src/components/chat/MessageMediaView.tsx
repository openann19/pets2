/**
 * Message Media View Component
 * Displays images, videos, voice notes, and files in chat messages
 */
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
// ResizeMode and Video are not currently used - commented out to fix unused import error
// import { ResizeMode, Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { VoiceNotePlayer } from './VoiceNotePlayer';

export interface MessageMediaProps {
  type: 'image' | 'video' | 'voice' | 'file';
  url: string;
  thumbnail?: string;
  name?: string;
  size?: number;
  duration?: number;
  waveform?: number[];
  onPress?: () => void;
}

export function MessageMediaView({
  type,
  url,
  thumbnail,
  name,
  size,
  duration,
  waveform,
  onPress,
}: MessageMediaProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoError] = useState(false);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (type === 'image') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        {!imageError ? (
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View style={[styles.image, styles.errorContainer]}>
            <Ionicons name="image-outline" size={32} color={theme.colors.onMuted} />
            <Text style={[styles.errorText, { color: theme.colors.onMuted }]}>Failed to load image</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (type === 'video') {
    return (
      <View style={styles.videoContainer}>
        {thumbnail ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Image source={{ uri: thumbnail }} style={styles.videoThumbnail} />
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color={theme.colors.surface} />
              </View>
            </View>
            {duration !== undefined && (
              <View style={styles.durationBadge}>
                <Text style={[styles.durationText, { color: theme.colors.surface }]}>
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.videoPlaceholder}>
            {videoError ? (
              <>
                <Ionicons name="videocam-off-outline" size={32} color={theme.colors.onMuted} />
                <Text style={[styles.errorText, { color: theme.colors.onMuted }]}>Failed to load video</Text>
              </>
            ) : (
              <>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>Loading video...</Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  }

  if (type === 'voice') {
    return (
      <VoiceNotePlayer
        url={url}
        duration={duration || 0}
        waveform={waveform || []}
      />
    );
  }

  if (type === 'file') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.fileContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        activeOpacity={0.7}
      >
        <View style={styles.fileIconContainer}>
          <Ionicons name="document" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: theme.colors.onSurface }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {name || 'File'}
          </Text>
          {size !== undefined && (
            <Text style={[styles.fileSize, { color: theme.colors.onMuted }]}>
              {formatFileSize(size)}
            </Text>
          )}
        </View>
        <Ionicons name="download-outline" size={20} color={theme.colors.onMuted} />
      </TouchableOpacity>
    );
  }

  return <View />;
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    imageContainer: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      maxWidth: 250,
      maxHeight: 300,
    },
    image: {
      width: '100%',
      height: 200,
      minHeight: 150,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      fontSize: 12,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    videoContainer: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      maxWidth: 250,
      maxHeight: 300,
    },
    videoThumbnail: {
      width: '100%',
      height: 200,
      minHeight: 150,
    },
    playButtonOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 4, // Offset for play icon
    },
    durationBadge: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
    },
    durationText: {
      fontSize: 11,
      fontWeight: '600',
    },
    videoPlaceholder: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.sm,
    },
    loadingText: {
      fontSize: 12,
    },
    fileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      maxWidth: 280,
      gap: theme.spacing.md,
    },
    fileIconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      borderRadius: theme.radii.md,
    },
    fileInfo: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    fileName: {
      fontSize: 14,
      fontWeight: '500',
    },
    fileSize: {
      fontSize: 12,
    },
  });
}

