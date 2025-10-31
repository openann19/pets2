import React from 'react';
import type { ComponentType } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

type ProtectedRouteProps = NativeStackScreenProps<RootStackParamList>;

export function ProtectedRoute({
  component: Component,
  ...props
}: ProtectedRouteProps & { 
  component: ComponentType<any>;
}): React.ReactElement {
  // Stub implementation - add authentication logic here if needed
  // Using ComponentType<any> to accept screens with specific route prop types
  return <Component {...props} />;
}
