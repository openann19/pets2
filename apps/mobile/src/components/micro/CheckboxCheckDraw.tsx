/**
 * ☑️ CHECKBOX CHECK-DRAW
 * Checkmark strokes in (~180ms) with slight bounce; background fades in
 * Crisp at 1x/3x scale; no aliasing
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { motion, getEasingArray, getSpringConfig } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';
import { Text } from '../ui/v2/Text';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxCheckDrawProps {
  label?: string;
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  size?: CheckboxSize;
  disabled?: boolean;
  testID?: string;
}

const sizeMap = {
  sm: { boxSize: 18, iconSize: 12 },
  md: { boxSize: 22, iconSize: 14 },
  lg: { boxSize: 28, iconSize: 18 },
};

/**
 * Checkbox with check-draw animation
 * Checkmark strokes in with bounce, background fades
 */
export function CheckboxCheckDraw({
  label,
  checked,
  onValueChange,
  size = 'md',
  disabled = false,
  testID,
}: CheckboxCheckDrawProps): React.JSX.Element {
  const theme = useTheme();
  const guards = useMotionGuards();
  const sizeStyles = sizeMap[size];
  const boxSize = sizeStyles.boxSize;

  const checkProgress = useSharedValue(checked ? 1 : 0);
  const bgOpacity = useSharedValue(checked ? 1 : 0);
  const boxScale = useSharedValue(1);

  React.useEffect(() => {
    if (!guards.shouldAnimate) {
      checkProgress.value = checked ? 1 : 0;
      bgOpacity.value = checked ? 1 : 0;
      return;
    }

    if (checked) {
      // Checkmark stroke animation with bounce
      checkProgress.value = withSequence(
        withTiming(0.8, {
          duration: motion.duration.fast,
          easing: getEasingArray('standard'),
        }),
        withSpring(1, {
          ...getSpringConfig('bouncy'),
          damping: 15,
        }),
      );

      // Background fade in
      bgOpacity.value = withTiming(1, {
        duration: motion.duration.fast,
      });

      // Box scale bounce
      boxScale.value = withSequence(
        withSpring(1.1, getSpringConfig('bouncy')),
        withSpring(1, getSpringConfig('standard')),
      );
    } else {
      // Fade out
      checkProgress.value = withTiming(0, {
        duration: motion.duration.fast,
      });
      bgOpacity.value = withTiming(0, {
        duration: motion.duration.fast,
      });
      boxScale.value = 1;
    }
  }, [checked, guards.shouldAnimate]);

  const animatedBoxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: boxScale.value }],
    };
  });

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      opacity: checkProgress.value,
    };
  });

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      opacity: bgOpacity.value,
      backgroundColor: theme.colors.primary,
    };
  });

  const handlePress = () => {
    if (!disabled) {
      // Light haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onValueChange(!checked);
    }
  };

  // Checkmark path (simple checkmark shape)
  const checkmarkPath = 'M 6 12 L 10 16 L 18 8';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: theme.radii.sm,
            borderWidth: 2,
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            opacity: disabled ? 0.5 : 1,
          },
          animatedBoxStyle,
        ]}
      >
        {checked && (
          <>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: theme.radii.sm,
                },
                animatedBgStyle,
              ]}
            />
            <Animated.View style={[styles.checkContainer, animatedCheckStyle]}>
              <Svg
                width={sizeStyles.iconSize}
                height={sizeStyles.iconSize}
                viewBox="0 0 24 24"
              >
                <SvgPath
                  d={checkmarkPath}
                  stroke={theme.colors.onPrimary || '#FFFFFF'}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>
          </>
        )}
      </Animated.View>
      {label && (
        <Text
          variant="body"
          tone="text"
          style={{ marginLeft: theme.spacing.sm }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  checkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
