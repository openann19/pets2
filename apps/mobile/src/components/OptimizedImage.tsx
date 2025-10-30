import React, { useState, useCallback, useMemo } from "react";
import { logger } from "@pawfectmatch/core";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  type StyleProp,
  type ViewStyle,
  type ImageStyle,
} from "react-native";
import FastImage from "react-native-fast-image";
import type {
  FastImageProps,
  Priority,
  ResizeMode,
  Source,
} from "react-native-fast-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

interface OptimizedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showLoadingIndicator?: boolean;
  showErrorState?: boolean;
  fallbackIcon?: string;
  priority?: Priority;
  resizeMode?: ResizeMode;
  cache?: "immutable" | "web" | "cacheOnly";
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: unknown) => void;
  accessible?: boolean;
  accessibilityLabel?: string;
}

/**
 * Optimized Image Component using FastImage
 * Implements P-05: Use react-native-fast-image for caching on Android
 * Features:
 * - Advanced caching strategies
 * - Loading and error states
 * - Performance optimizations
 * - Accessibility support
 * - Preloading capabilities
 * - Memory management
 */
export function OptimizedImage(props: OptimizedImageProps): React.ReactElement {
  const {
    uri,
    style,
    containerStyle,
    showLoadingIndicator = true,
    showErrorState = true,
    fallbackIcon = "image-outline",
    priority = "normal" as Priority,
    resizeMode = "cover" as ResizeMode,
    cache = "immutable",
    onLoadStart,
    onLoadEnd,
    onError,
    accessible = true,
    accessibilityLabel,
    ...restProps
  } = props;
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback(
    (error: Error | unknown) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);

      if (__DEV__) {
        logger.warn("OptimizedImage load error:", { error });
      }
    },
    [onError],
  );

  const imageSource: Source = {
    uri,
    priority: priority ?? "normal",
    cache: cache ?? "immutable",
  } as Source;

  return (
    <View style={[styles.container, containerStyle]}>
      <FastImage
        {...restProps}
        source={imageSource}
        style={[styles.image, style] as any}
        resizeMode={resizeMode ?? "cover"}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError as any}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || `Image: ${uri}`}
        accessibilityRole="image"
      />

      {/* Loading Indicator */}
      {isLoading && showLoadingIndicator && (
        <View
          style={[styles.overlay, styles.loadingOverlay]}
        >
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            accessible={true}
            accessibilityLabel="Loading image"
          />
        </View>
      )}

      {/* Error State */}
      {hasError && showErrorState && (
        <View
          style={[
            styles.overlay,
            styles.errorOverlay,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          accessible={true}
          accessibilityLabel="Image failed to load"
          accessibilityRole="alert"
        >
          <Ionicons
            name={fallbackIcon}
            size={32}
            color={theme.colors.onSurface}
            style={styles.errorIcon}
          />
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.onSurface },
            ]}
          >
            Image unavailable
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Preload images for better performance
 * Useful for preloading next pet images in swipe stack
 */
export const preloadImages = (
  uris: string[],
  priority: Priority = FastImage.priority.low,
): void => {
  const sources = uris.map((uri) => ({
    uri,
    priority,
    cache: "immutable" as const,
  }));

  FastImage.preload(sources);
};

/**
 * Clear image cache
 * Useful for memory management
 */
export const clearImageCache = (): Promise<void> => {
  return FastImage.clearMemoryCache();
};

/**
 * Clear disk cache
 * Useful for storage management
 */
export const clearDiskCache = (): Promise<void> => {
  return FastImage.clearDiskCache();
};

/**
 * Get cache size information
 */
export const getCacheSize = (): Promise<{
  memoryCache: number;
  diskCache: number;
}> => {
  // Note: This would need to be implemented with native modules
  // For now, return a placeholder
  return Promise.resolve({ memoryCache: 0, diskCache: 0 });
};

/**
 * High Priority Image Component
 * For critical images like the current swipe card
 */
export function HighPriorityImage(
  props: Omit<OptimizedImageProps, "priority">,
): React.JSX.Element {
  return <OptimizedImage {...props} priority={FastImage.priority.high} />;
}

/**
 * Low Priority Image Component
 * For background or prefetch images
 */
export function LowPriorityImage(
  props: Omit<OptimizedImageProps, "priority">,
): React.JSX.Element {
  return <OptimizedImage {...props} priority={FastImage.priority.low} />;
}

/**
 * Avatar Image Component
 * Optimized for small profile images
 */
export function AvatarImage({
  size = 40,
  style,
  ...props
}: OptimizedImageProps & { size?: number }): React.JSX.Element {
  return (
    <OptimizedImage
      {...props}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      resizeMode={FastImage.resizeMode.cover}
      cache="web" // Use web cache for avatars as they might change
    />
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  errorOverlay: {
    borderWidth: 1,
    borderStyle: "dashed",
  },
  errorIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  errorText: {
    fontSize: theme.typography.body.size * 0.75,
    textAlign: "center",
    opacity: 0.6,
  },
  });
}
