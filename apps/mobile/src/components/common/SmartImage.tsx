/**
 * SmartImage Component with FastImage Support
 * Fixes P-05: Use react-native-fast-image for caching on Android
 */

import { useEffect, useState, memo } from 'react';
import { Image, View, StyleSheet, type ImageProps } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
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

  // Extract resizeMode and source
  const { resizeMode, source, ...imageProps } = rest as any;

  // Convert source to FastImage format if needed
  const fastImageSource =
    useFastImage && source && typeof source === 'object' && 'uri' in source
      ? {
          uri: source.uri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }
      : source;

  if (useShimmer) {
    return (
      <View style={[styles.wrap, { borderRadius: rounded }, style]}>
        {!errored && <Shimmer radius={rounded} />}
        {!errored && useFastImage && fastImageSource ? (
          <Animated.View style={[StyleSheet.absoluteFillObject, as]}>
            <FastImage
              source={fastImageSource}
              resizeMode={FastImage.resizeMode[resizeMode || 'cover']}
              onLoad={(e) => {
                setLoaded(true);
                onLoad?.(e as any);
              }}
              onError={(e) => {
                setErrored(true);
                onError?.(e as any);
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
      {useFastImage && fastImageSource ? (
        <>
          <FastImage
            source={fastImageSource}
            resizeMode={FastImage.resizeMode[resizeMode || 'cover']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Full res crossfade */}
          <Animated.View style={[StyleSheet.absoluteFillObject, as]}>
            <FastImage
              source={fastImageSource}
              resizeMode={FastImage.resizeMode[resizeMode || 'cover']}
              onLoad={(e) => {
                setLoaded(true);
                onLoad?.(e as any);
              }}
              onError={(e) => {
                setErrored(true);
                onError?.(e as any);
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
