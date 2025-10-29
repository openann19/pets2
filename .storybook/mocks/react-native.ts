import * as RNWeb from 'react-native-web';

const Platform = {
  ...RNWeb.Platform,
  OS: 'web',
  Version: 'storybook-web',
  select: (options: Record<string, any>) => options.web ?? options.default,
};

const StyleSheet = {
  create: (styles: Record<string, any>) => styles,
  flatten: (...styles: any[]) => Object.assign({}, ...styles),
};

const Animated = {
  View: RNWeb.View,
  Text: RNWeb.Text,
  ScrollView: RNWeb.ScrollView,
  createAnimatedComponent: (Component: any) => Component,
  Value: function Value(this: any, initial: number) {
    this.value = initial;
  },
};

const Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: (_handler: (options: { colorScheme: 'light' | 'dark' }) => void) => ({ remove: () => {} }),
};

const AccessibilityInfo = {
  isReduceMotionEnabled: async () => false,
  addEventListener: (_event: string, _handler: (enabled: boolean) => void) => ({ remove: () => {} }),
};

const Dimensions = {
  get: () => ({ width: 1280, height: 720 }),
};

const NativeModules = {};

const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  in: (t: number) => t * t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};

const Alert = {
  alert: (title?: string, message?: string) => {
    // eslint-disable-next-line no-console
    console.warn('[Alert]', title ?? '', message ?? '');
  },
};

const useColorScheme = () => 'light';

export const View = RNWeb.View;
export const Text = RNWeb.Text;
export const ScrollView = RNWeb.ScrollView;
export const Pressable = (RNWeb as any).Pressable ?? RNWeb.View;
export const TouchableOpacity = (RNWeb as any).TouchableOpacity ?? RNWeb.Pressable ?? RNWeb.View;
export const TextInput = (RNWeb as any).TextInput ?? RNWeb.View;
export const Switch = (RNWeb as any).Switch ?? RNWeb.View;
export const ActivityIndicator = (RNWeb as any).ActivityIndicator ?? RNWeb.View;

export {
  Platform,
  StyleSheet,
  Animated,
  Appearance,
  AccessibilityInfo,
  Dimensions,
  NativeModules,
  Easing,
  Alert,
  useColorScheme,
};

export default {
  Platform,
  StyleSheet,
  Animated,
  Appearance,
  AccessibilityInfo,
  Dimensions,
  NativeModules,
  Easing,
  Alert,
  useColorScheme,
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
};

