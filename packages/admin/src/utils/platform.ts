// Platform detection and adaptation utilities
import React from 'react';
export const isReactNative = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
};

export const isWeb = (): boolean => {
  return !isReactNative();
};

// Platform-specific component adaptation
// NOTE: For JSX usage, convert this file to .tsx
// This utility returns a component factory function
export const createPlatformComponent = <P extends Record<string, unknown>>(
  webComponent: React.ComponentType<P>,
  nativeComponent?: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const Component = isReactNative() && nativeComponent
      ? nativeComponent
      : webComponent;

    // For actual JSX usage, convert file to .tsx and use:
    // return <Component {...props} />;
    return React.createElement(Component, props);
  };
};

// Platform-specific styling adaptation
export const createPlatformStyles = (webStyles: Record<string, unknown>, nativeStyles?: Record<string, unknown>) => {
  return isReactNative() && nativeStyles ? nativeStyles : webStyles;
};

// Common platform-agnostic utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce utility for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
