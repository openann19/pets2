import React, { useState, useCallback } from "react";
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
import FastImage, {
  type FastImageProps,
  type Priority,
  type ResizeMode,
} from "react-native-fast-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface OptimizedImageProps extends Omit<FastImageProps, "source"> {
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
export function OptimizedImage({
  uri,
  style,
  containerStyle,
  showLoadingIndicator = true,
  showErrorState = true,
  fallbackIcon = "image-outline",
  priority = FastImage.priority.normal,
  resizeMode = FastImage.resizeMode.cover,
  cache = "immutable",
  onLoadStart,
  onLoadEnd,
  onError,
  accessible = true,
  accessibilityLabel,
  ...props
}): React.JSX.Element {
  const { colors } = useTheme();
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
    (error: unknown) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);

      if (__DEV__) {
        logger.warn("OptimizedImage load error:", { error });
      }
    },
    [onError],
  );

  const imageSource = {
    uri,
    priority,
    cache,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FastImage
        {...props}
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || `Image: ${uri}`}
        accessibilityRole="image"
      />

      {/* Loading Indicator */}
      {isLoading && showLoadingIndicator && (
        <View style={[styles.overlay, styles.loadingOverlay]}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
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
            { backgroundColor: colors.card },
          ]}
          accessible={true}
          accessibilityLabel="Image failed to load"
          accessibilityRole="alert"
        >
          <Ionicons
            name={fallbackIcon}
            size={32}
            color={colors.text}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: colors.text }]}>
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
): JSX.Element {
  return <OptimizedImage {...props} priority={FastImage.priority.high} />;
}

/**
 * Low Priority Image Component
 * For background or prefetch images
 */
export function LowPriorityImage(
  props: Omit<OptimizedImageProps, "priority">,
): JSX.Element {
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
}: OptimizedImageProps & { size?: number }): JSX.Element {
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

const styles = StyleSheet.create({
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
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  errorIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
});

export default OptimizedImage;
