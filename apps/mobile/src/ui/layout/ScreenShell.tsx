/**
 * 🖼️ SCREEN SHELL - UNIVERSAL LAYOUT
 * Every screen MUST use this wrapper
 * Provides: header space, safe areas, gradients, consistent spacing
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/Provider';

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
    <View style={s.root}>
      <LinearGradient
        colors={[theme.colors.neutral[50], `${theme.colors.primary[500]}10`]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={s.safe}>
        {header}
        <View style={s.body}>{children}</View>
        {footer}
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: theme.colors.bg 
  },
  safe: { 
    flex: 1, 
    paddingHorizontal: theme.spacing.xl 
  },
  body: { 
    flex: 1, 
    paddingTop: theme.spacing.lg, 
    paddingBottom: theme.spacing.xl 
  },
});

