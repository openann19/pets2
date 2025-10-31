/**
 * ProtectedRoute Component
 * 
 * Navigation guard that enforces authentication and authorization checks
 * before allowing access to protected screens.
 * 
 * Features:
 * - Authentication checks
 * - Loading states during auth verification
 * - Automatic redirect to login
 * - Deep linking support with redirect preservation
 * - Onboarding flow enforcement
 * 
 * Usage:
 * <Stack.Screen name="Profile">
 *   {(props) => <ProtectedRoute {...props} component={ProfileScreen} />}
 * </Stack.Screen>
 */

import React, { useEffect, useState, type ComponentType } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/useAuthStore';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { RootStackParamList } from './types';

interface ProtectedRouteProps<RouteName extends keyof RootStackParamList> {
  component: ComponentType<NativeStackScreenProps<RootStackParamList, RouteName>>;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  redirectTo?: keyof RootStackParamList;
}

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

/**
 * ProtectedRoute wrapper component that guards routes based on authentication state
 */
export function ProtectedRoute<RouteName extends keyof RootStackParamList>({
  component: Component,
  requireAuth = true,
  requireOnboarding = false,
  redirectTo,
}: ProtectedRouteProps<RouteName>): React.JSX.Element | null {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>() as NativeStackNavigationProp<RootStackParamList>;
  const route = useRoute<RouteProp<RootStackParamList, RouteName>>() as RouteProp<RootStackParamList, RouteName>;
  const theme = useTheme() as AppTheme;
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(() => requireOnboarding);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Check onboarding status if required
  useEffect(() => {
    let isMounted = true;
    
    if (requireOnboarding) {
      AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
        .then((value) => {
          if (isMounted) {
            setIsOnboarded(value === 'true');
            setIsCheckingOnboarding(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsOnboarded(false);
            setIsCheckingOnboarding(false);
          }
        });
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsCheckingOnboarding(false);
        }
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [requireOnboarding]);

  // Handle authentication redirect
  useEffect(() => {
    if (authLoading || isCheckingOnboarding) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const targetRoute = (redirectTo || 'Login') as keyof RootStackParamList;
      const currentRoute = route.name as string;
      
      // Navigate to login with return route
      if (targetRoute === 'Login') {
        navigation.navigate('Login', {
          redirectTo: currentRoute,
          redirectParams: route.params,
        });
      } else {
        navigation.navigate(targetRoute);
      }
      return;
    }

    // If onboarding is required but not completed
    if (requireOnboarding && !isOnboarded) {
      navigation.navigate('Welcome');
      return;
    }
  }, [
    isAuthenticated,
    authLoading,
    isCheckingOnboarding,
    isOnboarded,
    requireAuth,
    requireOnboarding,
    navigation,
    route.name,
    route.params,
    redirectTo,
  ]);

  // Show loading state while checking auth/onboarding
  if (authLoading || isCheckingOnboarding) {
    const styles = getStyles(theme);
    return (
      <View style={styles.loadingContainer} testID="protected-route-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Don't render if redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireOnboarding && !isOnboarded) {
    return null;
  }

  // Render protected component with properly typed props
  const screenProps = {
    navigation,
    route,
  } as NativeStackScreenProps<RootStackParamList, RouteName>;
  
  return <Component {...screenProps} />;
}

// Styles will use theme colors dynamically
const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.bg,
    },
  });

