import React, { type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { GlassCard } from "./GlassCard";

/**
 * GlassModal Component
 * Modal with glass morphism effect
 */

interface GlassModalProps extends ViewProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
  style?: ViewStyle;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  children,
  visible,
  onClose,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute" as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        },
        animatedStyle,
      ]}
      onTouchStart={onClose}
    >
      <GlassCard
        variant="premium"
        size="lg"
        style={[
          {
            maxWidth: "90%",
            maxHeight: "80%",
          },
          style,
        ]}
        {...props}
      >
        {children}
      </GlassCard>
    </Animated.View>
  );
};

export default GlassModal;

