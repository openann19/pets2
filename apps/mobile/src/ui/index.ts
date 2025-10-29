/**
 * 🎨 UI SYSTEM EXPORTS
 * Single entry point for all UI primitives
 */

export { useMotion, Motion } from './motion/useMotion';
export { haptic } from './haptics';
export { ScreenShell } from './layout/ScreenShell';
export { StaggerList } from './lists/StaggerList';
export { BouncePressable } from './pressables/BouncePressable';

export type { ScreenShellProps } from './layout/ScreenShell';
export type { MotionPreset, MotionConfig } from './motion/useMotion';
export type { BouncePressableProps } from './pressables/BouncePressable';
