import type { ComponentType } from 'react';
import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from './types';

interface ProtectedRouteProps<T extends keyof RootStackParamList> extends StackScreenProps<RootStackParamList, T> {
  component: ComponentType<StackScreenProps<RootStackParamList, T>>;
}

/**
 * ProtectedRoute - Route protection wrapper
 * Can be extended with authentication checks, permission validation, etc.
 */
export function ProtectedRoute<T extends keyof RootStackParamList>({
  component: Component,
  ...props
}: ProtectedRouteProps<T>): React.ReactElement {
  // TODO: Add authentication check here if needed
  // For now, just render the component
  return <Component {...props} />;
}
