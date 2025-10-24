import React from 'react';
import type { ComponentType } from 'react';

/**
 * A wrapper for motion components to fix React 19 type compatibility issues
 * This helper creates a component that handles the type conflicts between
 * React 19 and Framer Motion event handlers
 */
export declare function createMotionComponent<P extends Record<string, unknown>>(
  Component: ComponentType<P>
): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionButton: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionDiv: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionSpan: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionA: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionUl: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionLi: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionImg: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const MotionP: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const createDraggableMotionComponent: <P extends Record<string, unknown>>(
  Component: ComponentType<P>
) => React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export declare const DraggableMotionDiv: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
//# sourceMappingURL=motion-helper.d.ts.map