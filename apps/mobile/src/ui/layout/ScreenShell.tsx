/**
 * 🖼️ SCREEN SHELL - UNIVERSAL LAYOUT
 * Every screen MUST use this wrapper
 * Provides: header space, safe areas, gradients, consistent spacing
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../theme/unified-theme';

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
  return (
    <View style={s.root}>
      <LinearGradient
        colors={[Theme.colors.neutral[50], `${Theme.colors.primary[500]}10`]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        {header}
        <View style={s.body}>{children}</View>
        {footer}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: Theme.colors.neutral[0] 
  },
  safe: { 
    flex: 1, 
    paddingHorizontal: Theme.spacing.xl 
  },
  body: { 
    flex: 1, 
    paddingTop: Theme.spacing.lg, 
    paddingBottom: Theme.spacing.xl 
  },
});

