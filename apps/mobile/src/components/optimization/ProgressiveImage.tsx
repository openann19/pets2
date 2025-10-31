/**
 * Progressive Image Component
 * 
 * Implements progressive loading with blur-up placeholders and adaptive quality
 * based on network speed. Uses memory-efficient caching.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ImageStyle, ViewStyle } from 'react-native';
import FastImage, { FastImageProps, Priority, Source } from 'react-native-fast-image';
import { useTheme } from '@/theme';
import { useNetworkQuality } from '@/hooks/performance/useNetworkQuality';

interface ProgressiveImageProps extends Omit<FastImageProps, 'source'> {
  /** Full quality image source */
  source: Source | number;
  /** Low quality placeholder (blur-up) */
  placeholder?: Source | number;
  /** Estimated height for layout preservation */
  estimatedHeight?: number;
  /** Whether to show loading indicator */
  showLoader?: boolean;
  /** Custom style */
  style?: ImageStyle | ImageStyle[];
  /** Container style */
  containerStyle?: ViewStyle | ViewStyle[];
  /** Adaptive quality based on network */
  adaptive?: boolean;
}

/**
 * Progressive image with blur-up, adaptive quality, and layout preservation
 */
export function ProgressiveImage({
  source,
  placeholder,
  estimatedHeight = 200,
  showLoader = true,
  style,
  containerStyle,
  adaptive = true,
  priority = Priority.normal,
  ...props
}: ProgressiveImageProps): React.JSX.Element {
  const theme = useTheme();
  const networkQuality = useNetworkQuality();
  const [currentSource, setCurrentSource] = useState<Source | number | null>(
    placeholder || null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine image quality based on network
  const getAdaptivePriority = (): Priority => {
    if (!adaptive) return priority;
    
    switch (networkQuality) {
      case 'slow':
        return Priority.low;
      case 'fast':
        return Priority.high;
      default:
        return priority;
    }
  };

  // Load high quality image after placeholder
  useEffect(() => {
    if (placeholder && isLoading) {
      // Small delay to show placeholder
      const timer = setTimeout(() => {
        setCurrentSource(source);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!placeholder) {
      setCurrentSource(source);
    }
  }, [source, placeholder, isLoading]);

  const handleLoadEnd = () => {
    setIsLoading(false);
    if (currentSource !== source) {
      setCurrentSource(source);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const displaySource = currentSource || source;

  return (
    <View
      style={[
        styles.container,
        { minHeight: estimatedHeight, backgroundColor: theme.colors.surface },
        containerStyle,
      ]}
    >
      {displaySource && !hasError ? (
        <FastImage
          source={displaySource}
          style={[styles.image, style]}
          priority={getAdaptivePriority()}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode={FastImage.resizeMode.cover}
          {...props}
        />
      ) : (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.surface }]}>
          {showLoader && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
      )}
      
      {isLoading && showLoader && displaySource === placeholder && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
