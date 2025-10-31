/**
 * Lazy-loaded screen components for performance optimization
 * These screens are code-split and only loaded when needed
 */

import React, { lazy, type ComponentType } from 'react';
import type { ScreenProps } from './types';

// Lazy load Chat Screen (large component with heavy dependencies)
export const LazyChatScreen: ComponentType<ScreenProps<'Chat'>> = lazy(
  () => import('../screens/ChatScreen').then((module) => ({ default: module.default }))
);

// Lazy load Premium Screens (heavy subscription logic)
export const LazyPremiumScreen: ComponentType<ScreenProps<'Premium'>> = lazy(
  () => import('../screens/premium/PremiumScreen').then((module) => ({ default: module.default }))
);

export const LazyManageSubscriptionScreen: ComponentType<ScreenProps<'ManageSubscription'>> = lazy(
  () =>
    import('../screens/premium/ManageSubscriptionScreen').then((module) => ({
      default: module.default,
    }))
);

export const LazySubscriptionManagerScreen: ComponentType<ScreenProps<'SubscriptionManager'>> = lazy(
  () =>
    import('../screens/premium/SubscriptionManagerScreen').then((module) => ({
      default: module.default,
    }))
);

// Lazy load AI Screens (heavy AI processing dependencies)
export const LazyAIBioScreen: ComponentType<ScreenProps<'AIBio'>> = lazy(
  () => import('../screens/ai/AIBioScreen').then((module) => ({ default: module.default }))
);

export const LazyAICompatibilityScreen: ComponentType<ScreenProps<'AICompatibility'>> = lazy(
  () =>
    import('../screens/ai/AICompatibilityScreen').then((module) => ({ default: module.default }))
);

export const LazyAIPhotoAnalyzerScreen: ComponentType<ScreenProps<'AIPhotoAnalyzer'>> = lazy(
  () =>
    import('../screens/ai/AIPhotoAnalyzerScreen').then((module) => ({ default: module.default }))
);
