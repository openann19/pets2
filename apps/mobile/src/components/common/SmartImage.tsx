/**
 * SmartImage Component with FastImage Support
 * Fixes P-05: Use react-native-fast-image for caching on Android
 */

import { useEffect, useState, memo } from 'react';
import { Image, View, StyleSheet, type ImageProps } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import type { ResizeMode as FastImageResizeMode, Source } from 'react-native-fast-image';
import Shimmer from '../micro/Shimmer';

type Props = ImageProps & {
  previewBlurRadius?: number;
  rounded?: number;
  useShimmer?: boolean;
  useFastImage?: boolean; // Enable FastImage caching (default: true)
};

const SmartImage = memo(function SmartImage({
  previewBlurRadius = 16,
  style,
  onLoad,
  onError,
  rounded = 12,
  useShimmer = false,
  useFastImage = true, // Default to FastImage for better caching
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const o = useSharedValue(0);

  useEffect(() => {
    if (loaded) o.value = withTiming(1, { duration: 260 });
  }, [loaded, o]);

  const as = useAnimatedStyle(() => ({ opacity: o.value }));

  // Extract resizeMode and source with proper typing
  type ResizeMode = 'contain' | 'cover' | 'stretch' | 'center';
  const resizeModeTyped: ResizeMode = 
    (rest.resizeMode as ResizeMode | undefined) || 'cover';
  const { resizeMode, source, ...imageProps } = rest;

  // Type-safe resizeMode mapping
  const resizeModeMap: Record<ResizeMode, FastImageResizeMode> = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };

  // Convert source to FastImage format if needed
  const fastImageSource: Source | number | ImageProps['source'] | undefined =
    useFastImage && source && typeof source === 'object' && 'uri' in source && source.uri
      ? {
          uri: source.uri,
          priority: 'normal' as const,
          cache: 'immutable' as const,
        } satisfies Source
      : source;

  if (useShimmer) {
    return (
      <View style={[styles.wrap, { borderRadius: rounded }, style]}>
        {!errored && <Shimmer radius={rounded} />}
        {!errored && useFastImage && fastImageSource && typeof fastImageSource === 'object' && 'uri' in fastImageSource ? (
          <Animated.View style={[StyleSheet.absoluteFillObject, as]}>
            <FastImage
              source={fastImageSource as Source}
              resizeMode={resizeModeMap[resizeModeTyped]}
              onLoad={() => {
                setLoaded(true);
                if (onLoad) {
                  // FastImage doesn't provide event, but Image does
                  // Create a minimal event-like object for compatibility
                  onLoad({} as Parameters<NonNullable<ImageProps['onLoad']>>[0]);
                }
              }}
              onError={() => {
                setErrored(true);
                if (onError) {
                  onError({} as Parameters<NonNullable<ImageProps['onError']>>[0]);
                }
              }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ) : !errored ? (
          <Animated.Image
            {...imageProps}
            source={source}
            resizeMode={resizeMode}
            onLoad={(e) => {
              setLoaded(true);
              onLoad?.(e);
            }}
            onError={(e) => {
              setErrored(true);
              onError?.(e);
            }}
            style={[StyleSheet.absoluteFillObject, as]}
          />
        ) : null}
        {errored && (
          <View style={[styles.fallback, { borderRadius: rounded }]}>
            {/* fallback - could show icon here */}
          </View>
        )}
      </View>
    );
  }

  return (
      <View style={[styles.wrap, style]}>
      {/* Low-fi placeholder */}
      {useFastImage && fastImageSource && typeof fastImageSource === 'object' && 'uri' in fastImageSource ? (
        <>
          <FastImage
            source={fastImageSource as Source}
            resizeMode={resizeModeMap[resizeModeTyped]}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Full res crossfade */}
          <Animated.View style={[StyleSheet.absoluteFillObject, as]}>
            <FastImage
              source={fastImageSource as Source}
              resizeMode={resizeModeMap[resizeModeTyped]}
              onLoad={() => {
                setLoaded(true);
                if (onLoad) {
                  // FastImage doesn't provide event, but Image does
                  // Create a minimal event-like object for compatibility
                  onLoad({} as Parameters<NonNullable<ImageProps['onLoad']>>[0]);
                }
              }}
              onError={() => {
                setErrored(true);
                if (onError) {
                  onError({} as Parameters<NonNullable<ImageProps['onError']>>[0]);
                }
              }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </>
      ) : (
        <>
          <Image
            {...imageProps}
            source={source}
            resizeMode={resizeMode}
            blurRadius={previewBlurRadius}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Full res crossfade */}
          <Animated.Image
            {...imageProps}
            source={source}
            resizeMode={resizeMode}
            onLoad={(e) => {
              setLoaded(true);
              onLoad?.(e);
            }}
            onError={(e) => {
              setErrored(true);
              onError?.(e);
            }}
            style={[StyleSheet.absoluteFillObject, as]}
          />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', position: 'relative' },
  fallback: { flex: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
});
export { SmartImage };
export default SmartImage;
