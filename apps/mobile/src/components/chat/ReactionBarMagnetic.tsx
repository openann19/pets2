import { useTheme } from '@mobile/theme';
import { useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../hooks/useReducedMotion';

export type ReactionItem = { emoji: string; label?: string };
export interface ReactionBarMagneticProps {
  reactions?: ReactionItem[];
  onSelect: (emoji: string) => void;
  onCancel?: () => void;
  influenceRadius?: number; // px
  baseSize?: number; // px
  backgroundColor?: string;
  borderColor?: string;
}

const DEFAULTS: ReactionItem[] = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
];

const springCfg = (reduced: boolean) => (reduced ? undefined : { damping: 18, stiffness: 340 });

export default function ReactionBarMagnetic({
  reactions = DEFAULTS,
  onSelect,
  onCancel,
  influenceRadius = 80,
  baseSize = 28,
  backgroundColor,
  borderColor,
}: ReactionBarMagneticProps) {
  const theme = useTheme();
  const reduced = useReduceMotion();

  // centers.x shared for each reaction
  const centers = useMemo(
    () => reactions.map(() => ({ x: useSharedValue(0) })),
    [reactions.length],
  );
  const touchX = useSharedValue<number | null>(null);
  const active = useSharedValue(false);

  const onItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const center = centers[index];
    if (center) {
      center.x.value = x + width / 2;
    }
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      active.value = true;
      touchX.value = e.x;
    })
    .onChange((e) => {
      touchX.value = e.x;
    })
    .onEnd(() => {
      const x = touchX.value;
      active.value = false;
      if (x == null) {
        onCancel?.();
        touchX.value = null;
        return;
      }
      ('worklet');
      let bestIdx = 0;
      let bestDist = 1e9;
      for (let i = 0; i < centers.length; i++) {
        const center = centers[i];
        const centerX = center?.x.value ?? 0;
        const d = Math.abs(centerX - x);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const chosen = reactions[bestIdx];
      if (chosen) runOnJS(onSelect)(chosen.emoji);
      touchX.value = null;
    })
    .onFinalize(() => {
      active.value = false;
      touchX.value = null;
    });

  const styles = makeStyles(theme, backgroundColor, borderColor);

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.wrap}
        accessibilityRole="radiogroup"
        testID="reaction-bar"
      >
        {reactions.map((r, i) => {
          const animated = useAnimatedStyle(() => {
            const center = centers[i];
            const x = center?.x.value ?? 0;
            const t = touchX.value;
            const isActive = active.value && t != null;

            // proximity 0..1
            const p = !isActive
              ? 0
              : Math.max(0, 1 - Math.abs(((t as number) - x) / influenceRadius));

            const scale = 1 + p * 0.35; // up to 1.35x
            const lift = -p * 14; // -14px
            const tilt = reduced ? 0 : (p * 12 * ((t as number) - x)) / influenceRadius;

            const yAnim = reduced
              ? withTiming(isActive ? lift : 0, { duration: 120 })
              : withSpring(isActive ? lift : 0, springCfg(reduced));

            const sAnim = reduced
              ? withTiming(isActive ? scale : 1, { duration: 120 })
              : withSpring(isActive ? scale : 1, springCfg(reduced));

            return {
              transform: [{ translateY: yAnim }, { rotate: `${tilt}deg` }, { scale: sAnim }],
              zIndex: Math.round(100 * scale),
            };
          });

          return (
            <Animated.View
              key={r.emoji}
              onLayout={onItemLayout(i)}
              style={styles.item}
              accessibilityRole="radio"
              accessibilityLabel={r.label ?? r.emoji}
              testID={`reaction-${i}`}
              accessibilityState={{ selected: false }}
            >
              <Animated.Text style={[styles.emoji, { fontSize: baseSize }, animated]}>
                {r.emoji}
              </Animated.Text>
            </Animated.View>
          );
        })}
      </View>
    </GestureDetector>
  );
}

const makeStyles = (theme: any, bg?: string, border?: string) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: bg ?? theme.colors.bg,
      borderColor: border ?? theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      gap: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    item: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 36,
      minHeight: 36,
    },
    emoji: {
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
