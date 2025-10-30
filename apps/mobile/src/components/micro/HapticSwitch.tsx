import { useEffect } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@mobile/theme';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export default function HapticSwitch({ value, onValueChange, disabled }: Props) {
  const theme = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = 0;
    pulse.value = withTiming(1, { duration: 450 });
  }, [value]);

  const ring = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value,
    transform: [{ scale: 1 + 0.35 * (1 - pulse.value) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { borderColor: theme.colors.primary }, ring]}
      />
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={(v) => {
          Haptics.selectionAsync();
          onValueChange(v);
        }}
        trackColor={{ false: theme.palette.neutral[200], true: '#fce7f3' }}
        thumbColor={value ? theme.colors.primary : theme.palette.neutral[400]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 52,
    height: 32,
    borderRadius: 20,
    borderWidth: 2,
  },
});
