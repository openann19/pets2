import { useEffect } from 'react';
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
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { springs } from '@/foundation/motion';

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
  sentColor,
  deliveredColor,
  readColor,
  failedColor,
}: MessageStatusTicksProps) {
  const theme = useTheme() as AppTheme;
  
  // Use provided colors or fall back to semantic theme colors
  const defaultSentColor = sentColor ?? theme.colors.onMuted;
  const defaultDeliveredColor = deliveredColor ?? theme.colors.onMuted;
  const defaultReadColor = readColor ?? theme.colors.primary;
  const defaultFailedColor = failedColor ?? theme.colors.danger;
  // crossfade / scale pop between states
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // enter
    opacity.value = withTiming(1, { duration: 120 });
    scale.value = withSpring(1, springs.snappy);

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
  let color = defaultSentColor;

  if (status === 'sending') {
    name = 'time-outline';
    color = defaultSentColor;
  } else if (status === 'sent') {
    name = 'checkmark';
    color = defaultSentColor;
  } else if (status === 'delivered') {
    name = 'checkmark-done';
    color = defaultDeliveredColor;
  } else if (status === 'read') {
    name = 'checkmark-done';
    color = defaultReadColor;
  } else if (status === 'failed') {
    name = 'alert-circle';
    color = defaultFailedColor;
  }

  return (
    <Animated.View style={[styles.wrap, ...(iconStyle ? [iconStyle] : [])] as any}>
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
