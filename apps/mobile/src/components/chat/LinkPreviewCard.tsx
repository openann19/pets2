/**
 * Link Preview Card Component
 * Displays rich previews for URLs found in chat messages
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/unified-theme';
import type { LinkPreviewData } from '../../services/linkPreviewService';

export interface LinkPreviewCardProps {
  data: LinkPreviewData;
  onPress?: () => void;
  onClose?: () => void;
}

export function LinkPreviewCard({ data, onPress, onClose }: LinkPreviewCardProps): JSX.Element {
  const { title, description, image, siteName, url } = data;

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
          <Ionicons name="close-circle" size={20} color={Theme.colors.text.secondary} />
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
          <Ionicons name="link" size={32} color={Theme.colors.text.tertiary} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title || 'Link'}
        </Text>
        
        {description && (
          <Text style={styles.description} numberOfLines={2}>
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
                color={Theme.colors.text.secondary}
              />
              <Text style={styles.siteName}>{siteName}</Text>
            </View>
          )}
          
          <Text style={styles.url} numberOfLines={1}>
            {url}
          </Text>
        </View>
      </View>

      {/* External link icon */}
      <View style={styles.externalIcon}>
        <Ionicons
          name="open-outline"
          size={16}
          color={Theme.colors.primary[500]}
        />
      </View>
    </TouchableOpacity>
  );
}

export function LinkPreviewCardLoading(): JSX.Element {
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

export function LinkPreviewCardError({ url, onRetry }: { url: string; onRetry?: () => void }): JSX.Element {
  return (
    <View style={[styles.container, styles.errorContainer]}>
      <Ionicons name="alert-circle-outline" size={24} color={Theme.colors.status.error} />
      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>Failed to load preview</Text>
        <Text style={styles.errorUrl} numberOfLines={1}>
          {url}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityLabel="Retry loading preview"
        >
          <Ionicons name="refresh" size={16} color={Theme.colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.depth.xs,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.xs,
    right: Theme.spacing.xs,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.xs,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: Theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  siteNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  siteName: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.secondary,
  },
  url: {
    flex: 1,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
  },
  externalIcon: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
  },
  loadingContainer: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
  },
  loadingImage: {
    width: '100%',
    height: 160,
    backgroundColor: Theme.colors.neutral[100],
  },
  loadingContent: {
    padding: Theme.spacing.md,
  },
  loadingTitle: {
    height: 20,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: Theme.borderRadius.xs,
    marginBottom: Theme.spacing.xs,
  },
  loadingDescription: {
    height: 16,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.xs,
    marginBottom: Theme.spacing.sm,
  },
  loadingFooter: {
    height: 14,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.xs,
    width: '60%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderColor: Theme.colors.status.error,
  },
  errorContent: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  errorTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.status.error,
    marginBottom: Theme.spacing.xs,
  },
  errorUrl: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  retryButton: {
    padding: Theme.spacing.xs,
  },
});

