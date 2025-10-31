/**
 * Type declarations for @shopify/react-native-skia
 * Stub types when module is not installed
 */

declare module '@shopify/react-native-skia' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ViewStyle } from 'react-native';

  export interface SkiaValue<T> {
    current: T;
  }

  export interface SkiaComputedValue<T> {
    current: T;
  }

  export interface SkiaCanvasProps {
    style?: ViewStyle;
    children?: ReactNode;
  }

  export interface SkiaRectProps {
    x: number;
    y: number;
    width: number;
    height: number;
    children?: ReactNode;
  }

  export interface SkiaCircleProps {
    cx: number;
    cy: number;
    r: number;
    color: string;
  }

  export interface SkiaLinearGradientProps {
    start: { x: number; y: number } | SkiaComputedValue<{ x: number; y: number }>;
    end: { x: number; y: number } | SkiaComputedValue<{ x: number; y: number }>;
    colors: string[];
  }

  export const Canvas: ComponentType<SkiaCanvasProps>;
  export const Rect: ComponentType<SkiaRectProps>;
  export const Circle: ComponentType<SkiaCircleProps>;
  export const LinearGradient: ComponentType<SkiaLinearGradientProps>;

  export function useValue<T>(initialValue: T): SkiaValue<T>;
  export function useComputedValue<T>(
    compute: () => T,
    deps: unknown[]
  ): SkiaComputedValue<T>;
  export function vec(x: number, y: number): { x: number; y: number };
}

