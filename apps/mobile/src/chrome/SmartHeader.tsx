/**
 * 🎯 SMART HEADER - Persistent, context-aware header with gestures
 * Edge-to-edge blur, dynamic actions, overflow, swipe gestures
 * Reduce motion & capability gates baked in
 */

import { useMemo, useState, useCallback } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useReduceMotion } from '../hooks/useReducedMotion';
import { useCapabilities } from '@/foundation/capabilities';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../navigation/types';
import { pickHeaderActions } from './pickHeaderActions';
import { ACTIONS, type HeaderContext } from './actions';
import { ActionButton } from './ActionButton';
import { OverflowButton } from './OverflowButton';
import { OverflowSheet } from './OverflowSheet';
import { TitleArea } from './TitleArea';
import { HeaderIcon } from './HeaderIcon';
import { AuroraSheen } from '../components/effects/AuroraSheen';

type Props = {
  ctx: HeaderContext;
  scrollY?: Animated.SharedValue<number> | undefined;
  title: string;
  subtitle?: string | undefined;
};

export function SmartHeader({ ctx, scrollY, title, subtitle }: Props) {
  const theme = useTheme() as AppTheme;
  const reducedMotion = useReduceMotion();
  const caps = useCapabilities();
  const navigation = useNavigation<NavigationProp>();
  const [overflowOpen, setOverflowOpen] = useState(false);

  const { primary, overflow } = useMemo(
    () => pickHeaderActions(ACTIONS, ctx, 4),
    [ctx]
  );

  // Capability-gated blur intensity
  const baseIntensity = Platform.OS === 'ios' ? 20 : 0;
  const blurIntensity =
    caps.highPerf && caps.thermalsOk && !reducedMotion
      ? baseIntensity
      : Math.min(baseIntensity, 10);

  // Animated header height (collapses on scroll)
  const headerStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return { height: 60 };
    }
    const y = scrollY.value;
    const height = reducedMotion
      ? 60
      : interpolate(y, [0, 120], [60, 48], Extrapolation.CLAMP);
    return { height };
  });

  // Swipe gestures
  const translateX = useSharedValue(0);
  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!reducedMotion) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (reducedMotion) return;
      const threshold = 50;
      if (e.translationX > threshold) {
        // Swipe right → Swipe screen
        runOnJS(() => {
          navigation.navigate('Swipe');
        })();
      } else if (e.translationX < -threshold) {
        // Swipe left → Messages
        runOnJS(() => {
          navigation.navigate('Matches');
        })();
      }
      translateX.value = withTiming(0, { duration: 200 });
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: reducedMotion ? 0 : translateX.value }],
  }));

  const handleActionPress = useCallback(
    (action: typeof ACTIONS[0]) => {
      action.onPress(navigation);
    },
    [navigation]
  );

  const handleLongPress = useCallback(
    (action: typeof ACTIONS[0]) => {
      if (action.id === 'search' && action.onLongPress) {
        action.onLongPress(navigation);
      }
    },
    [navigation]
  );

  const Shell = Platform.OS === 'ios' ? BlurView : View;
  const shellProps =
    Platform.OS === 'ios'
      ? { intensity: blurIntensity, tint: 'dark' as const }
      : {
          style: {
            backgroundColor: theme.colors.surface + 'E6',
          },
        };

  const styles = makeStyles(theme);

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          headerStyle,
          swipeStyle,
        ]}
      >
        <GestureDetector gesture={swipeGesture}>
          <Shell {...shellProps} style={styles.shell}>
            {/* Aurora sheen effect */}
            {caps.highPerf && caps.thermalsOk && (
              <AuroraSheen
                {...(scrollY !== undefined && { scrollY })}
                height={60}
                theme={theme}
              />
            )}
            <View style={styles.content}>
              <TitleArea
                title={title}
                {...(subtitle !== undefined && { subtitle })}
              />
              <View style={styles.actions}>
                {primary.map((action) => (
                  <ActionButton
                    key={action.id}
                    icon={<HeaderIcon name={action.icon} />}
                    label={action.a11yLabel || action.label}
                    badge={action.badge?.(ctx) ?? undefined}
                    onPress={() => handleActionPress(action)}
                    onLongPress={() => handleLongPress(action)}
                  />
                ))}
                {overflow.length > 0 && (
                  <OverflowButton onPress={() => setOverflowOpen(true)} />
                )}
              </View>
            </View>
          </Shell>
        </GestureDetector>
      </Animated.View>
      <OverflowSheet
        visible={overflowOpen}
        actions={overflow}
        ctx={ctx}
        onClose={() => setOverflowOpen(false)}
        onActionPress={handleActionPress}
      />
    </>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      elevation: 8,
    },
    shell: {
      flex: 1,
      paddingTop: 12,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 8,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

