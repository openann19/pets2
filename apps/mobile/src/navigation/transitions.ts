// src/navigation/transitions.ts
import { Platform } from "react-native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const screenTransitions = {
  iosModal: {
    presentation: 'modal' as const,
    gestureEnabled: true,
  } as NativeStackNavigationOptions,
  
  iosPush: {
    gestureEnabled: true,
    animation: 'slide_from_right' as const,
  } as NativeStackNavigationOptions,
  
  androidFade: {
    animation: 'fade_from_bottom' as const,
  } as NativeStackNavigationOptions,

  // NEW: fluid cross-fade + subtle parallax (great default on Android)
  fluid: Platform.select({
    ios: {
      gestureEnabled: true,
      animation: 'slide_from_right' as const,
    },
    android: {
      gestureEnabled: true,
      animation: 'fade_from_bottom' as const,
    },
  }) as NativeStackNavigationOptions,

  // NEW: subtle scale for modalish screens (profile, settings)
  scale: {
    gestureEnabled: true,
    animation: 'default' as const,
  } as NativeStackNavigationOptions,
};
