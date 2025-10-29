import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageStatusTicksProps {
  status: MessageStatus;
  size?: number;
  // colors
  sentColor?: string; // e.g. gray500
  deliveredColor?: string; // e.g. gray500
  readColor?: string; // e.g. brand blue
  failedColor?: string; // e.g. error red
}

export default function MessageStatusTicks({
  status,
  size = 14,
  sentColor = '#9ca3af',
  deliveredColor = '#9ca3af',
  readColor = '#3b82f6',
  failedColor = '#ef4444',
}: MessageStatusTicksProps) {
  // crossfade / scale pop between states
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // enter
    opacity.value = withTiming(1, { duration: 120 });
    scale.value = withSpring(1, { damping: 14, stiffness: 420 });

    // pulsing only while "sending"
    cancelAnimation(pulse);
    if (status === 'sending') {
      pulse.value = withRepeat(withTiming(0.9, { duration: 450 }), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 120 });
    }
  }, [status]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulse.value }],
  }));

  // choose icon + color
  let name: any = 'time-outline';
  let color = sentColor;

  if (status === 'sending') {
    name = 'time-outline';
    color = sentColor;
  } else if (status === 'sent') {
    name = 'checkmark';
    color = sentColor;
  } else if (status === 'delivered') {
    name = 'checkmark-done';
    color = deliveredColor;
  } else if (status === 'read') {
    name = 'checkmark-done';
    color = readColor;
  } else if (status === 'failed') {
    name = 'alert-circle';
    color = failedColor;
  }

  return (
    <Animated.View style={[styles.wrap, iconStyle]}>
      <Ionicons
        name={name}
        size={size}
        color={color}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 16,
    minHeight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
