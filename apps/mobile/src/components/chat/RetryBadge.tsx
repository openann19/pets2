import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springs } from '@/foundation/motion';

export default function RetryBadge({
  onPress,
  disabled,
  bg,
}: {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  bg?: string;
}) {
  const { colors } = useTheme();

  const backgroundColor = bg || colors.danger;
  const iconColor = colors.onSurface;
  const rippleColor = colors.onSurface + '1F'; // Add alpha
  const s = useSharedValue(1);
  const sty = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const bounce = () => {
    'worklet';
    s.value = 0.92;
    s.value = withSpring(1, springs.snappy);
  };

  const handlePress = () => {
    bounce();
    const r = onPress();
    if (r && typeof (r as any).then === 'function') {
      // no-op; the bubble can react (shake) based on promise result
    }
  };

  return (
    <Animated.View style={[styles.wrap, sty]}>
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: rippleColor, borderless: true }}
        disabled={disabled}
        style={[styles.btn, { backgroundColor: backgroundColor }]}
        accessibilityRole="button"
        accessibilityLabel="Retry sending message"
        accessibilityHint="Tap to retry sending this failed message"
        accessibilityState={{ disabled: !!disabled }}
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Ionicons
          name="refresh"
          size={14}
          color={iconColor}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginLeft: 6 },
  btn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});
