/**
 * React 19 compatibility helper
 * Provides a wrapper that makes ForwardRef components usable as JSX elements
 * React 19 handles ForwardRef components natively, so we just return them as-is
 */
import type React from 'react';
/**
 * Creates a React 19 compatible component from a ForwardRef component
 * In React 19, ForwardRef components can be used directly as JSX elements
 * This function simply returns the component with proper typing
 */
export declare function createComponent<T extends React.ForwardRefExoticComponent<any> | React.ComponentType<any>>(Component: T): T;
//# sourceMappingURL=react-types.d.ts.map