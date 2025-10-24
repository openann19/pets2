export * from './user';
export * from './pet';
export * from './message';

// Re-export legacy type shapes so external code can import them via
// `@pawfectmatch/core` instead of deep relative paths.
export type { LegacyWebPet } from './pet';
export type { LegacyWebMessage } from './message';
export type { LegacyWebUser } from './user';
