/**
 * @deprecated Use components/index.ts instead
 * This file is kept for backward compatibility during migration
 */

import { logger } from '@pawfectmatch/core';

// Re-export all components from the main index
export * from './index';

let warned = false;
if (!warned) {
  logger.warn('[DEPRECATION] components/index.tsx → use components/index instead.');
  warned = true;
}

// === LEGACY COMPONENTS (TO BE DEPRECATED) ===
// These are kept for backward compatibility during migration
export {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
} from './EliteComponents';
export { default as InteractiveButton } from './InteractiveButton';
export { default as SwipeCard } from './ModernSwipeCard'; // Alias to ModernSwipeCard
export { default as MotionPrimitives } from './MotionPrimitives';

// === MIGRATION HELPERS ===
export const MigrationHelpers = {
  // Helper to deprecate old components
  deprecateComponent: (ComponentName: string, NewComponentName: string) => {
    logger.warn(`[DEPRECATION] ${ComponentName} is deprecated. Use ${NewComponentName} instead.`);
  },
};
