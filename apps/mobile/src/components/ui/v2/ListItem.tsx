import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, Switch as RNSwitch, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { springs } from '../../MotionPrimitives';
import { Text } from './Text';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useEnhancedVariants } from '@/hooks/animations';

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    left: { width: 48, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, justifyContent: 'center' },
    right: { marginLeft: 12 },
    leftIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export type ListItemType = 'navigation' | 'action' | 'toggle';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  type?: ListItemType;
  value?: boolean; // for toggle
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  rightIcon?: string;
  destructive?: boolean;
  style?: ViewStyle;
  testID?: string;
  premium?: boolean;
  glow?: boolean;
}

export function ListItem({
  title,
  subtitle,
  icon,
  type = 'navigation',
  value,
  onPress,
  onValueChange,
  rightIcon,
  destructive = false,
  style,
  testID,
  premium = true,
  glow = false,
}: ListItemProps) {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);

  // Enhanced variants for icons
  const iconGlow = useEnhancedVariants({
    variant: 'glow',
    enabled: premium && glow && type !== 'toggle',
    duration: 2000,
    color: destructive ? theme.colors.danger : theme.colors.primary,
    intensity: 0.5,
  });

  const aStyle = useAnimatedStyle(() => {
    const shadowOpacity = glow
      ? interpolate(
          glowOpacity.value,
          [0, 1],
          [0.05, 0.2],
          Extrapolate.CLAMP,
        )
      : 0.05;

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      shadowRadius: glowOpacity.value * 8 + 2,
      shadowColor: destructive ? theme.colors.danger : theme.colors.border,
      elevation: glowOpacity.value * 4 + 1,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const onPressIn = () => {
    if (reducedMotion) return;
    
    scale.value = withSpring(0.97, springs.snappy);
    iconScale.value = withSpring(0.9, springs.snappy);
    
    if (glow) {
      glowOpacity.value = withTiming(1, { duration: 150 });
    }
    
    if (premium && !reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const onPressOut = () => {
    if (reducedMotion) return;
    
    scale.value = withSpring(1, springs.snappy);
    iconScale.value = withSpring(1, springs.snappy);
    
    if (glow) {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  const handlePress = () => {
    if (type === 'toggle') return;
    onPress?.();
  };

  const LeftIcon = icon ? (
    <Animated.View
      style={StyleSheet.flatten([
        styles.leftIcon,
        {
          backgroundColor: destructive ? `${theme.colors.danger}22` : theme.colors.surface,
          borderRadius: theme.radii.md,
        },
        premium ? iconAnimatedStyle : undefined,
        glow ? iconGlow.animatedStyle : undefined,
      ])}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={destructive ? theme.colors.danger : theme.colors.onMuted}
      />
    </Animated.View>
  ) : null;

  const Right =
    type === 'toggle' ? (
      <RNSwitch
        value={!!value}
        onValueChange={(v) => onValueChange?.(v)}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.onPrimary : '#f1f1f1'}
        accessibilityRole="switch"
        accessibilityLabel={`${title} toggle`}
      />
    ) : rightIcon ? (
      <Ionicons
        name={rightIcon as any}
        size={18}
        color={theme.colors.onMuted}
      />
    ) : (
      type === 'navigation' && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.onMuted}
        />
      )
    );

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const Container = type === 'toggle' ? View : AnimatedPressable;

  return (
    <Container
      {...(type !== 'toggle' ? { onPress: handlePress } : {})}
      {...(type !== 'toggle' && premium ? { onPressIn, onPressOut } : {})}
      style={StyleSheet.flatten([
        styles.container,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
        type !== 'toggle' && premium ? aStyle : undefined,
        style,
      ])}
      accessibilityRole={type === 'toggle' ? 'switch' : 'button'}
      accessibilityLabel={subtitle ? `${title}: ${subtitle}` : title}
      testID={testID}
    >
      <View style={styles.left}>{LeftIcon}</View>
      <View style={styles.body}>
        <Text
          variant="label"
          tone={destructive ? 'danger' : 'text'}
          style={{ marginBottom: subtitle ? 2 : 0 }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            tone={destructive ? 'danger' : 'muted'}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{Right}</View>
    </Container>
  );
}

export default ListItem;
