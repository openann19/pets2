import React, { useEffect } from "react";
import { View, Switch, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Theme } from "../../theme/unified-theme";

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export default function HapticSwitch({ value, onValueChange, disabled }: Props) {
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
        style={[styles.ring, { borderColor: Theme.colors.primary[500] }, ring]}
      />
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={v => {
          Haptics.selectionAsync();
          onValueChange(v);
        }}
        trackColor={{ false: Theme.colors.neutral[200], true: "#fce7f3" }}
        thumbColor={value ? Theme.colors.primary[500] : Theme.colors.neutral[400]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: 52,
    height: 32,
    borderRadius: 20,
    borderWidth: 2,
  },
});

