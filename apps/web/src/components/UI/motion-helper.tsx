'use client';
import { motion } from 'framer-motion';
import React from 'react';
import type { ComponentType } from 'react';

/**
 * A wrapper for motion components to fix React 19 type compatibility issues
 * This helper creates a component that handles the type conflicts between
 * React 19 and Framer Motion event handlers
 */
export function createMotionComponent<P extends Record<string, unknown>>(
  Component: ComponentType<P>
): React.ForwardRefExoticComponent<React.RefAttributes<unknown>> {
  return React.forwardRef<unknown, P>((props, ref) => {
    // Filter out undefined values to satisfy exactOptionalPropertyTypes: true
    const cleanProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        cleanProps[key] = value;
      }
    }
    return React.createElement(Component, { ...cleanProps, ref });
  });
}
// Pre-defined motion components with proper typing
export const MotionButton = createMotionComponent(motion.button);
export const MotionDiv = createMotionComponent(motion.div);
export const MotionSpan = createMotionComponent(motion.span);
export const MotionA = createMotionComponent(motion.a);
export const MotionUl = createMotionComponent(motion.ul);
export const MotionLi = createMotionComponent(motion.li);
export const MotionImg = createMotionComponent(motion.img);
export const MotionP = createMotionComponent(motion.p);
// Export a wrapper for createDraggableMotionComponent with enhanced type support
export const createDraggableMotionComponent = <P extends Record<string, unknown>>(
  Component: ComponentType<P>
): React.ForwardRefExoticComponent<React.RefAttributes<unknown>> => {
  return React.forwardRef<unknown, P>((props, ref) => {
    // Filter out undefined values to satisfy exactOptionalPropertyTypes
    const cleanProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        cleanProps[key] = value;
      }
    }
    return React.createElement(Component, { ...cleanProps, ref });
  });
};
// Create draggable version of the div component
export const DraggableMotionDiv = createDraggableMotionComponent(motion.div);
//# sourceMappingURL=motion-helper.jsx.map