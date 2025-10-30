import { ScrollView, Text, View } from 'react-native';

type AnimatedStyle = Record<string, unknown>;

export const useSharedValue = <T,>(initialValue: T) => ({ value: initialValue });

export const useAnimatedStyle = <T extends AnimatedStyle>(factory: () => T) => factory();

export const useDerivedValue = <T,>(factory: () => T) => factory();

export const useAnimatedScrollHandler = () => ({});

export const withSpring = <T,>(value: T) => value;

export const withTiming = <T,>(value: T) => value;

export const runOnJS = <T extends (...args: any[]) => any>(fn: T) => fn;

export const runOnUI = <T extends (...args: any[]) => any>(fn: T) => fn;

export const createAnimatedComponent = <T>(Component: T): T => Component;

export const Easing = {
  linear: (value: number) => value,
};

const Animated = new Proxy(
  {},
  {
    get(_target, key) {
      switch (key) {
        case 'View':
          return View;
        case 'Text':
          return Text;
        case 'ScrollView':
          return ScrollView;
        case 'createAnimatedComponent':
          return createAnimatedComponent;
        default:
          return () => undefined;
      }
    },
  },
);

export const FadeIn = Animated;
export const FadeOut = Animated;
export const ZoomIn = Animated;
export const ZoomOut = Animated;
export const Layout = Animated;

export default {
  ...Animated,
  View,
  Text,
  ScrollView,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  withSpring,
  withTiming,
  runOnJS,
  runOnUI,
  createAnimatedComponent,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  Layout,
};

