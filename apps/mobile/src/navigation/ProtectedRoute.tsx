/**
 * Protected Route Component
 * Wraps screens that require authentication or specific permissions
 */

import React, { type ReactElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

type ProtectedRouteProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
> & {
  component: React.ComponentType<NativeStackScreenProps<RootStackParamList, RouteName>>;
};

/**
 * ProtectedRoute - Wraps a screen component with protection logic
 * Currently a pass-through component, can be extended with:
 * - Authentication checks
 * - Permission validation
 * - Subscription checks
 * - Rate limiting
 */
export function ProtectedRoute<RouteName extends keyof RootStackParamList>({
  component: Component,
  ...props
}: ProtectedRouteProps<RouteName>): ReactElement {
  // Future: Add protection logic here
  // - Check auth state
  // - Verify permissions
  // - Check subscription status
  // - Redirect if unauthorized

  return <Component {...props} />;
}
