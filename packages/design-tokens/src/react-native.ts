/**
 * React Native specific design tokens
 * Separate entry to avoid RN types in web/server builds
 */

// Type-only import to avoid build-time RN resolution
import type { ColorValue } from "react-native";

// Re-export all base tokens
export * from './index';

// RN-specific utilities
export function toRNColor(value: string): ColorValue {
  return value as unknown as ColorValue;
}

// RN-specific color helpers
export function getRNColorValue(colorObj: Record<string, string>, shade: string): ColorValue {
  const key = shade as keyof typeof colorObj;
  const color = colorObj[key] ?? "";
  return color as unknown as ColorValue;
}