/**
 * Link Preview Card Component
 * Displays rich previews for URLs found in chat messages
 */

import { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { LinkPreviewData } from '../../services/linkPreviewService';

export interface LinkPreviewCardProps {
  data: LinkPreviewData;
  onPress?: () => void;
  onClose?: () => void;
}

function makeStyles(theme: AppTheme) {
  const { colors, spacing, radii, shadows, typography, palette } = theme;

  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      overflow: 'hidden',
      marginVertical: spacing.sm,
      marginHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.elevation1,
    },
    closeButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: radii.full,
      padding: spacing.xs,
    },
    image: {
      width: '100%',
      height: 160,
    },
    imagePlaceholder: {
      width: '100%',
      height: 160,
      backgroundColor: palette.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: spacing.md,
    },
    title: {
      fontSize: typography.h2.size,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: spacing.xs,
      lineHeight: typography.h2.lineHeight,
    },
    description: {
      fontSize: typography.body.size,
      color: colors.onMuted,
      marginBottom: spacing.sm,
      lineHeight: typography.body.lineHeight,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    siteNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    siteName: {
      fontSize: typography.body.size * 0.75,
      fontWeight: '500',
      color: colors.onMuted,
    },
    url: {
      flex: 1,
      fontSize: typography.body.size * 0.75,
      color: colors.onMuted,
    },
    externalIcon: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
    },
    loadingContainer: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      overflow: 'hidden',
      marginVertical: spacing.sm,
      marginHorizontal: spacing.md,
    },
    loadingImage: {
      width: '100%',
      height: 160,
      backgroundColor: palette.neutral[100],
    },
    loadingContent: {
      padding: spacing.md,
    },
    loadingTitle: {
      height: 20,
      backgroundColor: palette.neutral[200],
      borderRadius: radii.xs,
      marginBottom: spacing.xs,
    },
    loadingDescription: {
      height: 16,
      backgroundColor: palette.neutral[100],
      borderRadius: radii.xs,
      marginBottom: spacing.sm,
    },
    loadingFooter: {
      height: 14,
      backgroundColor: palette.neutral[100],
      borderRadius: radii.xs,
      width: '60%',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderColor: colors.danger,
    },
    errorContent: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    errorTitle: {
      fontSize: typography.body.size,
      fontWeight: '500',
      color: colors.danger,
      marginBottom: spacing.xs,
    },
    errorUrl: {
      fontSize: typography.body.size * 0.75,
      color: colors.onMuted,
    },
    retryButton: {
      padding: spacing.xs,
    },
  });
}

export function LinkPreviewCard({ data, onPress, onClose }: LinkPreviewCardProps): JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const { title, description, image, siteName, url } = data;

  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Link preview: ${title || url}`}
      accessibilityHint="Double tap to open link"
    >
      {/* Close button */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close preview"
          accessibilityRole="button"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.onMuted}
          />
        </TouchableOpacity>
      )}

      {/* Thumbnail image */}
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={`Preview image for ${title || 'link'}`}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="link"
            size={32}
            color={colors.onMuted}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {title || 'Link'}
        </Text>

        {description && (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}

        {/* Domain and metadata */}
        <View style={styles.footer}>
          {siteName && (
            <View style={styles.siteNameContainer}>
              <Ionicons
                name="globe-outline"
                size={12}
                color={colors.onMuted}
              />
              <Text style={styles.siteName}>{siteName}</Text>
            </View>
          )}

          <Text
            style={styles.url}
            numberOfLines={1}
          >
            {url}
          </Text>
        </View>
      </View>

      {/* External link icon */}
      <View style={styles.externalIcon}>
        <Ionicons
          name="open-outline"
          size={16}
          color={colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

export function LinkPreviewCardLoading(): JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingImage} />
      <View style={styles.loadingContent}>
        <View style={styles.loadingTitle} />
        <View style={styles.loadingDescription} />
        <View style={styles.loadingFooter} />
      </View>
    </View>
  );
}

export function LinkPreviewCardError({
  url,
  onRetry,
}: {
  url: string;
  onRetry?: () => void;
}): JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.container, styles.errorContainer]}>
      <Ionicons
        name="alert-circle-outline"
        size={24}
        color={colors.danger}
      />
      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>Failed to load preview</Text>
        <Text
          style={styles.errorUrl}
          numberOfLines={1}
        >
          {url}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityLabel="Retry loading preview"
        >
          <Ionicons
            name="refresh"
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
