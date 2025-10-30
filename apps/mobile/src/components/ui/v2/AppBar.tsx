import { Ionicons } from '@expo/vector-icons';
import type { Theme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReduceMotion } from '../../../hooks/useReducedMotion';
import { springs } from '../../MotionPrimitives';

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 56,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    left: {
      width: 56,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
    },
    right: {
      width: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
  });
}

export interface AppBarAction {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export interface AppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: AppBarAction[];
  blur?: boolean;
  gradient?: boolean;
  testID?: string;
}

export function AppBar({
  title,
  subtitle,
  onBack,
  rightActions = [],
  blur = true,
  gradient = false,
  testID,
}: AppBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const Container: React.ComponentType<any> = blur ? BlurView : View;
  const containerProps = blur
    ? {
        intensity: Platform.OS === 'ios' ? 70 : 90,
        tint: theme.scheme === 'light' ? 'light' : 'dark',
      }
    : {};

  return (
    <View style={{ paddingTop: insets.top }}>
      {gradient && (
        <LinearGradient
          colors={[`${theme.colors.primary}20`, 'transparent']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}
      <Container
        {...containerProps}
        style={StyleSheet.flatten([
          styles.container,
          {
            backgroundColor: blur ? 'transparent' : theme.colors.bg,
            borderBottomColor: `${theme.colors.border}`,
          },
        ])}
        testID={testID}
      >
        <View style={styles.left}>
          {onBack && (
            <IconButton
              icon="chevron-back"
              color={theme.colors.onSurface}
              onPress={onBack}
              accessibilityLabel="Go back"
            />
          )}
        </View>

        <View
          style={styles.center}
          accessibilityRole="header"
        >
          <Text
            style={{
              color: theme.colors.onSurface,
              fontSize: 18,
              fontWeight: '700',
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                color: theme.colors.onMuted,
                fontSize: 12,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {rightActions?.map((a, idx) => (
            <IconButton
              key={String(idx)}
              icon={a.icon}
              color={theme.colors.onSurface}
              onPress={a.onPress}
              accessibilityLabel={a.accessibilityLabel || 'Action'}
            />
          ))}
        </View>
      </Container>
    </View>
  );
}

export default AppBar;

function IconButton({
  icon,
  color,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  color: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => {
    if (!reduceMotion) scale.value = withSpring(0.92, springs.snappy);
  };
  const onPressOut = () => {
    if (!reduceMotion) scale.value = withSpring(1, springs.snappy);
  };
  return (
    <Animated.View style={[styles.iconButton, aStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || 'Action'}
        hitSlop={12}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={color}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
