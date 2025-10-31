/**
 * StyleSheet utility with test fallback
 * 
 * This utility ensures StyleSheet is always available, even in Jest test environments
 * where the react-native mock might not be properly applied.
 * 
 * Usage:
 *   import { SafeStyleSheet } from '@/utils/styleSheet';
 *   const styles = SafeStyleSheet.create({ ... });
 */

import { StyleSheet, type ViewStyle, type TextStyle, type ImageStyle } from 'react-native';

// Fallback for test environments where StyleSheet might be undefined
export const SafeStyleSheet = StyleSheet || {
  create: <T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T => styles,
  flatten: <T extends ViewStyle | TextStyle | ImageStyle>(style: T): T => style,
  compose: (...styles: Array<ViewStyle | TextStyle | ImageStyle>): Array<ViewStyle | TextStyle | ImageStyle> => styles,
  hairlineWidth: 1,
  absoluteFill: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Re-export StyleSheet for convenience (falls back to SafeStyleSheet if needed)
export { SafeStyleSheet as StyleSheet };

