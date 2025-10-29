import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springs } from '../../MotionPrimitives';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 4,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
    },
    indicator: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      zIndex: 0,
    },
  });
}

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}

export function Tabs({ items, value, onChange, style }: TabsProps) {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const index = useMemo(
    () =>
      Math.max(
        0,
        items.findIndex((i) => i.key === value),
      ),
    [items, value],
  );
  const position = useSharedValue(index);
  useEffect(() => {
    position.value = withSpring(
      Math.max(
        0,
        items.findIndex((i) => i.key === value),
      ),
      springs.firm,
    );
  }, [items, value]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabCount = Math.max(1, items.length);
    const percentPerTab = 100 / tabCount;
    const left = `${position.value * percentPerTab}%` as any;
    const width = `${percentPerTab}%` as any;
    return { left, width } as any;
  });

  return (
    <View
      style={StyleSheet.flatten([
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.border,
        },
        style,
      ])}
      accessibilityRole="tablist"
    >
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: theme.colors.primary, borderRadius: theme.radii.md },
          indicatorStyle,
        ]}
      />
      {items.map((item) => {
        const selected = item.key === value;
        const s = useSharedValue(1);
        const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
        return (
          <Animated.View
            key={item.key}
            style={StyleSheet.flatten([aStyle, { flex: 1 }])}
          >
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              onPressIn={() => {
                s.value = withSpring(0.96, springs.snappy);
              }}
              onPressOut={() => {
                s.value = withSpring(1, springs.snappy);
              }}
              style={StyleSheet.flatten([
                styles.tab,
                {
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                  borderRadius: theme.radii.md,
                },
              ])}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
            >
              <Text
                style={{
                  color: selected ? theme.colors.onPrimary : theme.colors.onMuted,
                  fontWeight: '600',
                  fontSize: 14,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

export default Tabs;
