import { createLazyScreen } from '../components/LazyScreen';

/**
 * Lazy-loaded screens for code splitting and performance optimization
 * These screens are loaded on-demand to reduce initial bundle size
 */

// Chat Screen - Heavy with real-time messaging features
export const LazyChatScreen = createLazyScreen(() => import('../screens/ChatScreen'));

// Premium Screens - Heavy with subscription management
export const LazyPremiumScreen = createLazyScreen(() => import('../screens/PremiumScreen'));
export const LazyManageSubscriptionScreen = createLazyScreen(() => import('../screens/ManageSubscriptionScreen'));
export const LazySubscriptionManagerScreen = createLazyScreen(() => import('../screens/premium/SubscriptionManagerScreen'));

// AI Screens - Heavy with ML/AI features
export const LazyAIBioScreen = createLazyScreen(() => import('../screens/AIBioScreen'));
export const LazyAICompatibilityScreen = createLazyScreen(() => import('../screens/AICompatibilityScreen'));
export const LazyAIPhotoAnalyzerScreen = createLazyScreen(() => import('../screens/AIPhotoAnalyzerScreen'));
