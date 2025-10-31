/**
 * SettingsList Component
 * Handles animated wrapping of settings sections
 */
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReducedMotion';

interface SettingsListProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function SettingsList({
  children,
  delay = 0,
  duration = 200,
}: SettingsListProps): React.JSX.Element {
  const reducedMotion = useReduceMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <Animated.View entering={FadeInDown.duration(duration).delay(delay)}>
      {children}
    </Animated.View>
  );
}

