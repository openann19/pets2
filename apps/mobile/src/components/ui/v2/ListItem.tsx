import { Ionicons } from '@expo/vector-icons';
import type { Theme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, Switch as RNSwitch, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springs } from '../../MotionPrimitives';
import { Text } from './Text';

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
}: ListItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    scale.value = withSpring(0.98, springs.snappy);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, springs.snappy);
  };

  const LeftIcon = icon ? (
    <View
      style={StyleSheet.flatten([
        styles.leftIcon,
        {
          backgroundColor: destructive ? `${theme.colors.danger}22` : theme.colors.surface,
          borderRadius: theme.radii.md,
        },
      ])}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={destructive ? theme.colors.danger : theme.colors.onMuted}
      />
    </View>
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
      {...(type !== 'toggle' ? { onPress } : {})}
      {...(type !== 'toggle' ? { onPressIn, onPressOut } : {})}
      style={StyleSheet.flatten([
        styles.container,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        },
        type !== 'toggle' ? aStyle : undefined,
        style,
      ])}
      accessibilityRole={type === 'toggle' ? 'text' : 'button'}
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
