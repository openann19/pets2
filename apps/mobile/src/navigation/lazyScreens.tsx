/**
 * Lazy Screen Loader Component
 * Fixes P-03: Lazy-load heavy screens with React.lazy() + Suspense boundary
 * Implements lazy loading for heavy screens to improve startup performance
 * Note: Uses dynamic imports compatible with React Native and React Navigation
 */

import React, { Suspense, lazy, type ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import type { RootStackParamList } from './types';

/**
 * Loading fallback component for lazy-loaded screens
 */
const LoadingFallback: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

/**
 * Creates a lazy-loaded screen component with Suspense boundary
 * Compatible with React Navigation
 */
export function createLazyScreen<RouteName extends keyof RootStackParamList>(
  importFn: () => Promise<{ default: ComponentType<NativeStackScreenProps<RootStackParamList, RouteName>> }>,
  screenName: string,
): React.ComponentType<NativeStackScreenProps<RootStackParamList, RouteName>> {
  const LazyComponent = lazy(importFn);

  const LazyScreenWrapper: React.FC<NativeStackScreenProps<RootStackParamList, RouteName>> = (props) => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  LazyScreenWrapper.displayName = `LazyScreen(${screenName})`;
  return LazyScreenWrapper;
}

/**
 * Lazy-loaded screen components
 * These screens are loaded on-demand to improve startup performance
 * Fixes P-03: Lazy-load heavy screens
 */

// AI Screens - Heavy components with ML processing
export const LazyAICompatibilityScreen = createLazyScreen(
  () => import('../screens/AICompatibilityScreen'),
  'AICompatibility',
);

export const LazyAIBioScreen = createLazyScreen(() => import('../screens/AIBioScreen'), 'AIBio');

export const LazyAIPhotoAnalyzerScreen = createLazyScreen(
  () => import('../screens/AIPhotoAnalyzerScreen'),
  'AIPhotoAnalyzer',
);

// Premium Screens - Heavy with Stripe integration
export const LazyPremiumScreen = createLazyScreen(
  () => import('../screens/PremiumScreen'),
  'Premium',
);

export const LazyManageSubscriptionScreen = createLazyScreen(
  () => import('../screens/ManageSubscriptionScreen'),
  'ManageSubscription',
);

export const LazySubscriptionManagerScreen = createLazyScreen(
  () => import('../screens/premium/SubscriptionManagerScreen'),
  'SubscriptionManager',
);

// Chat Screen - Heavy with real-time features
export const LazyChatScreen = createLazyScreen(() => import('../screens/ChatScreen'), 'Chat');

// Advanced Feature Screens
export const LazyCommunityScreen = createLazyScreen(
  () => import('../screens/CommunityScreen'),
  'Community',
);

export const LazyStoriesScreen = createLazyScreen(() => import('../screens/StoriesScreen'), 'Stories');

export const LazyMemoryWeaveScreen = createLazyScreen(
  () => import('../screens/MemoryWeaveScreen'),
  'MemoryWeave',
);

export const LazyARScentTrailsScreen = createLazyScreen(
  () => import('../screens/ARScentTrailsScreen'),
  'ARScentTrails',
);

// Live Streaming Screens
export const LazyGoLiveScreen = createLazyScreen(() => import('../screens/GoLiveScreen'), 'GoLive');

export const LazyLiveViewerScreen = createLazyScreen(
  () => import('../screens/LiveViewerScreen'),
  'LiveViewer',
);

export const LazyLiveBrowseScreen = createLazyScreen(
  () => import('../screens/LiveBrowseScreen'),
  'LiveBrowse',
);

// Admin Screens - Heavy with analytics
export const LazyAdminNavigator = createLazyScreen(
  () => import('../navigation/AdminNavigator'),
  'AdminNavigator',
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

