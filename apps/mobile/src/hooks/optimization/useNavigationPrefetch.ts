/**
 * Navigation Prefetch Hook
 * 
 * Automatically prefetches routes based on navigation events
 */
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useNavigationState } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { logger } from '@pawfectmatch/core';
import { usePrefetching } from './usePrefetching';

/**
 * Route import map for lazy loading
 */
const ROUTE_IMPORTS: Record<string, () => Promise<any>> = {
  Swipe: () => import('../../screens/SwipeScreen'),
  Matches: () => import('../../screens/MatchesScreen'),
  Chat: () => import('../../screens/ChatScreen'),
  MyPets: () => import('../../screens/MyPetsScreen'),
  Community: () => import('../../screens/CommunityScreen'),
  Profile: () => import('../../screens/ProfileScreen'),
  Map: () => import('../../screens/MapScreen'),
};

/**
 * Likely next routes based on current route
 */
const ROUTE_PREDICTIONS: Record<string, string[]> = {
  Home: ['Swipe', 'Matches', 'Chat'],
  Swipe: ['Matches', 'Chat'],
  Matches: ['Chat'],
  Chat: ['Matches', 'Home'],
  MyPets: ['CreatePet'],
  Profile: ['Settings'],
};

/**
 * Hook for automatic route prefetching based on navigation
 */
export function useNavigationPrefetch() {
  const navigation = useNavigation<NavigationProp<any>>();
  const routeState = useNavigationState((state) => state);
  const { prefetchRoute } = usePrefetching({
    enableRoutePrefetch: true,
    wifiOnly: false,
  });

  useEffect(() => {
    if (!routeState) return;

    // Get current route name
    const getCurrentRoute = (state: any): string | null => {
      if (!state) return null;
      
      const route = state.routes[state.index];
      if (route.state) {
        return getCurrentRoute(route.state);
      }
      return route.name;
    };

    const currentRoute = getCurrentRoute(routeState);
    if (!currentRoute) return;

    // Prefetch likely next routes
    const nextRoutes = ROUTE_PREDICTIONS[currentRoute] || [];
    
    nextRoutes.forEach((routeName) => {
      const importFn = ROUTE_IMPORTS[routeName];
      if (importFn) {
        prefetchRoute(routeName, importFn).catch((error) => {
          logger.warn(`Failed to prefetch route ${routeName}:`, error);
        });
      }
    });
  }, [routeState, prefetchRoute]);

  // Listen to navigation events for predictive prefetching
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      const currentRoute = navigation.getCurrentRoute()?.name;
      if (!currentRoute) return;

      const nextRoutes = ROUTE_PREDICTIONS[currentRoute] || [];
      nextRoutes.forEach((routeName) => {
        const importFn = ROUTE_IMPORTS[routeName];
        if (importFn) {
          prefetchRoute(routeName, importFn).catch(() => {
            // Silently fail
          });
        }
      });
    });

    return unsubscribeFocus;
  }, [navigation, prefetchRoute]);
}

