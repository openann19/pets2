import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenProps extends ViewProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  children?: React.ReactNode;
}

export function Screen({
  edges,
  style,
  children,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    paddingTop: edges?.includes('top') ? 0 : insets.top,
    paddingBottom: edges?.includes('bottom') ? 0 : insets.bottom,
    paddingLeft: edges?.includes('left') ? 0 : insets.left,
    paddingRight: edges?.includes('right') ? 0 : insets.right,
  };

  return (
    <View
      style={[styles.container, safeAreaStyle, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
