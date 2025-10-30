import React, { type ReactNode } from 'react';
import { type ViewProps, type ViewStyle, StyleSheet } from 'react-native';
import { GlassContainer } from './GlassContainer';

/**
 * GlassNavigation Component
 * Bottom navigation bar with glass morphism effect
 */

interface GlassNavigationProps extends ViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const GlassNavigation: React.FC<GlassNavigationProps> = ({ children, style, ...props }) => {
  return (
    <GlassContainer
      intensity="heavy"
      transparency="light"
      border="light"
      shadow="medium"
      borderRadius="none"
      style={StyleSheet.flatten([
        {
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        style,
      ])}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

export default GlassNavigation;
