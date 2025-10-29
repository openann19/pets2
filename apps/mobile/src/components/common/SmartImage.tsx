import React, { useEffect, useState, memo } from "react";
import { Image, View, StyleSheet, type ImageProps } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import Shimmer from "../micro/Shimmer";

type Props = ImageProps & { previewBlurRadius?: number; rounded?: number; useShimmer?: boolean };

const SmartImage = memo(function SmartImage({ 
  previewBlurRadius = 16, 
  style, 
  onLoad, 
  onError,
  rounded = 12,
  useShimmer = false,
  ...rest 
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const o = useSharedValue(0);

  useEffect(() => {
    if (loaded) o.value = withTiming(1, { duration: 260 });
  }, [loaded, o]);

  const as = useAnimatedStyle(() => ({ opacity: o.value }));

  // Extract resizeMode if provided
  const { resizeMode, ...imageProps } = rest as any;

  if (useShimmer) {
    return (
      <View style={[styles.wrap, { borderRadius: rounded }, style]}>
        {!errored && <Shimmer radius={rounded} />}
        {!errored && (
          <Animated.Image
            {...imageProps}
            resizeMode={resizeMode}
            onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
            onError={(e) => { setErrored(true); onError?.(e); }}
            style={[StyleSheet.absoluteFillObject, as]}
          />
        )}
        {errored && (
          <View style={[styles.fallback, { borderRadius: rounded }]>
            {/* fallback - could show icon here */}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      {/* Low-fi placeholder */}
      <Image
        {...imageProps}
        resizeMode={resizeMode}
        blurRadius={previewBlurRadius}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Full res crossfade */}
      <Animated.Image
        {...imageProps}
        resizeMode={resizeMode}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        onError={(e) => { setErrored(true); onError?.(e); }}
        style={[StyleSheet.absoluteFillObject, as]}
      />
    </View>
  );
});

const styles = StyleSheet.create({ 
  wrap: { overflow: "hidden", position: "relative" },
  fallback: { flex: 1, backgroundColor: "rgba(0,0,0,0.08)" },
});
export { SmartImage };
export default SmartImage;

