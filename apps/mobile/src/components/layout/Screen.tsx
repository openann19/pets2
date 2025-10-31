import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  children: React.ReactNode;
}

export function Screen({
  children,
  style,
  scrollable = false,
  ...rest
}: ScreenProps): React.ReactElement {
  const theme = useTheme();

  const containerStyle = StyleSheet.compose(styles.base, [
    { backgroundColor: theme.colors.bg, paddingHorizontal: theme.spacing.lg },
    style,
  ]);

  const content = scrollable ? (
    <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView
      style={containerStyle}
      {...rest}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
