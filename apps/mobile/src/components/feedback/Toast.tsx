import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Theme } from '../../theme/unified-theme';

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  visible,
  onHide,
  duration = 3000,
}: ToastProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (visible) {
      translateY.value = withSpring(0, { stiffness: 300, damping: 30 });
      opacity.value = withTiming(1, { duration: 300 });

      timer = setTimeout(() => {
        translateY.value = withSpring(-100, { stiffness: 300, damping: 30 });
        // Some Reanimated typings complain about the 3rd callback arg.
        // Use setTimeout to avoid the overload error, and call JS callback normally.
        opacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
          onHide();
        }, 310);
      }, duration);
    } else {
      // Ensure values are reset when hidden
      translateY.value = withSpring(-100, { stiffness: 300, damping: 30 });
      opacity.value = withTiming(0, { duration: 300 });
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, translateY, opacity, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "Theme.colors.status.success", borderColor: "#059669" };
      case "error":
        return { backgroundColor: "Theme.colors.status.error", borderColor: "#dc2626" };
      default:
        return { backgroundColor: "#6366f1", borderColor: "#4f46e5" };
    }
  };

  if (!visible) return <></>;

  return (
    <Animated.View
      style={StyleSheet.flatten([
        styles.container,
        { top: insets.top + 10 },
        getTypeStyles(),
        animatedStyle,
      ])}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: "Theme.colors.neutral[0]",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
