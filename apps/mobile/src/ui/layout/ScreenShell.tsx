/**
 * 🖼️ SCREEN SHELL - UNIVERSAL LAYOUT
 * Every screen MUST use this wrapper
 * Provides: header space, safe areas, gradients, consistent spacing
 */

import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ScreenShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * ScreenShell - Universal screen wrapper
 *
 * Usage:
 * ```tsx
 * <ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass()} />}>
 *   <YourContent />
 * </ScreenShell>
 * ```
 */
export function ScreenShell({ header, children, footer }: ScreenShellProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.surface, `${theme.colors.primary}10`]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe}>
        {header}
        <View style={styles.body}>{children}</View>
        {footer}
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    safe: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    body: {
      flex: 1,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
  });
