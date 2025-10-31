import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';
import type { AppTheme } from '../theme';
import { getExtendedColors } from '../theme/adapters';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { springs } from '@/foundation/motion';

type IoniconsName = string;

type RouteName = 'Home' | 'Swipe' | 'Map' | 'Matches' | 'Profile' | 'AdoptionManager' | 'Premium';

const ICONS: Record<RouteName, { focused: IoniconsName; unfocused: IoniconsName }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Swipe: { focused: 'heart', unfocused: 'heart-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  Matches: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
  AdoptionManager: { focused: 'list', unfocused: 'list-outline' },
  Premium: { focused: 'star', unfocused: 'star-outline' },
};

const getSpringConfig = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return { damping: 1000, stiffness: 1000, mass: 0.9 };
  }
  return springs.gentle;
};

const getIcon = (routeName: RouteName, focused: boolean): IoniconsName =>
  focused ? ICONS[routeName].focused : ICONS[routeName].unfocused;

// Animated badge component for tab bar
function BadgeAnimation({
  count,
  colors,
}: {
  count: number;
  colors: ReturnType<typeof getExtendedColors>;
}) {
  const theme = useTheme() as AppTheme;
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(0);
  const reducedMotion = useReduceMotion();

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }

    // Entrance animation
    scale.value = 0;
    opacity.value = 0;
    scale.value = withSequence(
      withSpring(1.3, springs.bouncy),
      withSpring(1, springs.standard),
    );
    opacity.value = withTiming(1, { duration: 200 });

    // Pulse animation
    pulse.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 600 }),
    );
  }, [count, reducedMotion, opacity, pulse, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const pulseScale = 1 + pulse.value * 0.15;
    const pulseOpacity = interpolate(
      pulse.value,
      [0, 1],
      [1, 0.7],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale: scale.value * pulseScale }],
      opacity: opacity.value * pulseOpacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -6,
          right: -12,
          minWidth: 18,
          height: 18,
          paddingHorizontal: 4,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: colors.danger,
          backgroundColor: colors.danger,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: theme.colors.surface, fontSize: 10, fontWeight: '700' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
}

// Separate component for tab items to avoid hook rules violations
function TabItem({
  route,
  isFocused,
  scale,
  onPress,
  colors,
  styles,
  badgeCount,
}: {
  route: { key: string; name: string };
  isFocused: boolean;
  scale: { value: number } | undefined;
  onPress: () => void;
  colors: ReturnType<typeof getExtendedColors>;
  styles: ReturnType<typeof StyleSheet.create>;
  badgeCount: number;
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale?.value ?? 1 }],
  }));

  const routeName = (route.name as RouteName) ?? 'Home';
  const icon = getIcon(routeName, isFocused);

  return (
    <TouchableOpacity
      key={route.key}
      style={styles['tab']}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles['iconContainer']}>
        <View style={styles['iconWrap']}>
          <Animated.View style={iconStyle}>
            <Ionicons
              name={icon}
              size={24}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          {badgeCount > 0 && (
            <BadgeAnimation count={badgeCount} colors={colors} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ActivePillTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme() as AppTheme;
  const colors = getExtendedColors(theme);
  const dark = theme.isDark;
  const insets = useSafeAreaInsets();
  const reducedMotion = useReduceMotion();

  const baseStyles = {
    root: {
      paddingTop: 8,
    },
    bar: {
      marginHorizontal: 12,
      height: 64,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: Platform.OS === 'ios' ? 0 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    pill: {
      position: 'absolute',
      height: 48,
      borderRadius: 14,
      width: 60,
      marginHorizontal: 6,
    },
    tab: {
      flex: 1,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      position: 'relative',
    },
    iconWrap: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -12,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.colors.surface,
      fontSize: 10,
      fontWeight: '700',
    },
    label: {
      fontSize: 11,
      marginTop: 2,
    },
  } as const;

  const stylesLocal = (StyleSheet && typeof StyleSheet.create === 'function')
    ? StyleSheet.create(baseStyles as any)
    : (baseStyles as unknown as ReturnType<typeof StyleSheet.create>);
  const s = (stylesLocal || (baseStyles as any)) as typeof stylesLocal;

  // measure each tab
  const layoutsRef = useRef<Record<string, { x: number; w: number }>>({});

  // Keep track of last tap times for double-tap detection
  const lastTapRef = useRef<Record<string, number>>({});

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  // icon scale per tab - create individual shared values
  const iconScale1 = useSharedValue(1);
  const iconScale2 = useSharedValue(1);
  const iconScale3 = useSharedValue(1);
  const iconScale4 = useSharedValue(1);
  const iconScale5 = useSharedValue(1);
  const iconScale6 = useSharedValue(1);
  const iconScale7 = useSharedValue(1);

  // Map routes to shared values
  const iconScales = useMemo(() => {
    const scales = [
      iconScale1,
      iconScale2,
      iconScale3,
      iconScale4,
      iconScale5,
      iconScale6,
      iconScale7,
    ];
    return scales.slice(0, state.routes.length);
  }, [
    state.routes.length,
    iconScale1,
    iconScale2,
    iconScale3,
    iconScale4,
    iconScale5,
    iconScale6,
    iconScale7,
  ]);

  useEffect(() => {
    const route = state.routes[state.index];
    if (!route) return;
    const layout = layoutsRef.current[route.key];
    if (!layout) return;

    const springConfig = getSpringConfig(reducedMotion);

    indicatorX.value = reducedMotion
      ? withTiming(layout.x, { duration: 0 })
      : withSpring(layout.x, springConfig);
    indicatorW.value = reducedMotion
      ? withTiming(layout.w, { duration: 0 })
      : withSpring(layout.w, springConfig);

    // bounce the focused icon a touch
    // Access shared values directly by index to avoid modifying dependency array values
    const scaleIndex = state.index;
    if (scaleIndex >= 0 && scaleIndex < iconScales.length) {
      const scaleValue = iconScales[scaleIndex];
      if (scaleValue) {
        if (reducedMotion) {
          scaleValue.value = 1;
        } else {
          scaleValue.value = 1.15;
          scaleValue.value = withSpring(1, springs.snappy);
        }
      }
    }
    // subtle haptic
    if (!reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [state.index, state.routes, reducedMotion, indicatorX, indicatorW]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  // mock counts (replace with your store later)
  const getBadgeCount = (routeName: string) => {
    switch (routeName) {
      case 'Matches':
        return 3;
      case 'Home':
        return 2;
      case 'Map':
        return 1;
      default:
        return 0;
    }
  };

  const onTabLayout =
    (key: string) =>
    (e: LayoutChangeEvent): void => {
      const { x, width } = e.nativeEvent.layout;
      layoutsRef.current[key] = { x, w: width };
      // seed initial position on first layout pass
      const currentRoute = state.routes[state.index];
      if (currentRoute && key === currentRoute.key) {
        indicatorX.value = withTiming(x, { duration: 0 });
        indicatorW.value = withTiming(width, { duration: 0 });
      }
    };

  console.log('ActivePillTabBar: About to return JSX, state.routes length:', state.routes.length);

  return (
    <View
      style={[
        s.root,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: Platform.OS === 'android' ? colors.background : 'transparent',
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint={dark ? 'dark' : 'light'}
        style={[
          s.bar,
          {
            borderColor: colors.border,
          },
        ]}
      >
        {/* active pill */}
        <Animated.View
          style={[
            s.pill,
            {
              backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            },
            pillStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const rawLabel = options.tabBarLabel ?? options.title ?? route.name;

          // Ensure label is always a string
          const label = typeof rawLabel === 'string' ? rawLabel : String(rawLabel);

          const isFocused = state.index === index;
          const routeName = (route.name as RouteName) ?? 'Home';
          const badgeCount = getBadgeCount(routeName);

          const scale = iconScales[index];

          const onPress = () => {
            const now = Date.now();
            const last = lastTapRef.current[route.key] ?? 0;
            const delta = now - last;
            lastTapRef.current[route.key] = now;

            // Bounce animation on icon press
            if (scale && !reducedMotion) {
              scale.value = 0.9;
              scale.value = withSpring(1, springs.snappy);
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            // Double-tap detection: if focused and tapped within 300ms, fire custom event
            if (isFocused && delta < 300) {
              // Fire custom event with proper typing
              // tabDoublePress is a custom event type, not in React Navigation's standard types
              // Use type assertion through unknown to properly cast custom event
              (navigation.emit as unknown as (event: {
                type: 'tabDoublePress';
                target: string;
                canPreventDefault: false;
              }) => void)({
                type: 'tabDoublePress',
                target: route.key,
                canPreventDefault: false,
              });
            }

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              onLayout={onTabLayout(route.key)}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || `${label} tab`}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={s['tab']}
              activeOpacity={0.9}
            >
              <TabItem
                route={route}
                isFocused={isFocused}
                scale={scale}
                onPress={onPress}
                colors={colors}
                styles={s}
                badgeCount={badgeCount}
              />
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}
