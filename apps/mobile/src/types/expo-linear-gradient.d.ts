/**
 * Type definitions for expo-linear-gradient
 * Adds missing properties to fix TypeScript errors
 */

declare module 'expo-linear-gradient' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface LinearGradientPoint {
    x: number;
    y: number;
  }

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: LinearGradientPoint;
    end?: LinearGradientPoint;
    locations?: number[];
  }

  export class LinearGradient extends Component<LinearGradientProps> {}
}
