/**
 * Mobile Common Type Definitions
 * Replaces all `any` types with proper TypeScript interfaces for React Native
 */

import React from 'react';
import type { ComponentType } from 'react';
import type { RouteProp, NavigationProp } from '@react-navigation/native';

// Navigation Types
export interface RootStackParamList {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string };
  Profile: { userId?: string };
  CreatePet: undefined;
  Settings: undefined;
  Premium: undefined;
  AIBio: undefined;
  AIPhotoAnalyzer: undefined;
  AICompatibility: { pet1Id?: string; pet2Id?: string };
  AdoptionManager: undefined;
  AdoptionApplication: { petId: string };
  AdoptionContract: { applicationId: string };
  Map: undefined;
  MemoryWeave: { petId: string };
  ARScentTrails: undefined;
  PremiumDemo: undefined;
  ComponentShowcase: undefined;
  ComponentTest: undefined;
  NewComponentsTest: undefined;
  ModernSwipe: undefined;
  ModernCreatePet: undefined;
  MigrationExample: undefined;
}

// Screen Props Types
export interface BaseScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList>;
}

export interface ScreenProps<T extends keyof RootStackParamList = keyof RootStackParamList> {
  navigation: NavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
}

// Component Props Types
export interface BaseComponentProps {
  style?: Record<string, unknown>;
  testID?: string;
  children?: React.ReactNode;
}

export interface TouchableComponentProps extends BaseComponentProps {
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: unknown;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
  iterations?: number;
}

export interface SpringConfig {
  damping: number;
  mass: number;
  stiffness: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

export interface ScaleValue {
  value: number;
}

// Gesture Types
export interface GestureEvent {
  nativeEvent: {
    translationX: number;
    translationY: number;
    velocityX: number;
    velocityY: number;
    state: number;
  };
}

export interface PanGestureEvent extends GestureEvent {
  nativeEvent: {
    translationX: number;
    translationY: number;
    velocityX: number;
    velocityY: number;
    state: number;
    x: number;
    y: number;
    absoluteX: number;
    absoluteY: number;
  };
}

// Image Types
export interface ImageSource {
  uri: string;
  width?: number;
  height?: number;
  scale?: number;
}

export interface ImageError {
  error: string;
  uri?: string;
}

// Storage Types
export interface SecureStorageItem {
  key: string;
  value: string;
  options?: {
    requireAuthentication?: boolean;
    authenticationPrompt?: string;
    kSecAccessControl?: string;
  };
}

// Performance Types
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  flushInterval: number;
}

// Haptic Types
export interface HapticFeedbackConfig {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  impactStyle?: 'light' | 'medium' | 'heavy';
  notificationType?: 'success' | 'warning' | 'error';
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface ThemeShadows {
  small: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  large: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeStyles {
  colors: ThemeColors;
  shadows: ThemeShadows;
  typography: {
    h1: Record<string, unknown>;
    h2: Record<string, unknown>;
    h3: Record<string, unknown>;
    body: Record<string, unknown>;
    caption: Record<string, unknown>;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// API Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// Socket Types
export interface SocketEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface SocketConfig {
  url: string;
  options: {
    transports: string[];
    timeout: number;
    forceNew: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
  };
}

// WebRTC Types
export interface WebRTCConfig {
  iceServers: {
    urls: string[];
    username?: string;
    credential?: string;
  }[];
  iceCandidatePoolSize: number;
  iceTransportPolicy: 'all' | 'relay';
}

export interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  error?: string;
}

// Camera Types
export interface CameraConfig {
  type: 'front' | 'back';
  flashMode: 'auto' | 'on' | 'off';
  whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'incandescent' | 'fluorescent';
  focusMode: 'on' | 'off';
  zoom: number;
  ratio: string;
  quality: 'low' | 'medium' | 'high';
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  exif?: Record<string, unknown>;
}

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
}

export interface LocationConfig {
  accuracy: 'low' | 'balanced' | 'high' | 'passive';
  distanceFilter: number;
  interval: number;
  fastestInterval: number;
  timeout: number;
  maximumAge: number;
}

// Notification Types
export interface NotificationConfig {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
  category?: string;
  userInfo?: Record<string, unknown>;
}

export interface PushNotificationToken {
  token: string;
  type: 'ios' | 'android';
  deviceId: string;
}

// Error Types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}

export interface ErrorHandler {
  handleError: (error: Error, errorInfo?: Record<string, unknown>) => void;
  logError: (error: Error, context?: Record<string, unknown>) => void;
  reportError: (error: Error, metadata?: Record<string, unknown>) => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Generic Types
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncFunction<T = unknown, R = unknown> = (args: T) => Promise<R>;
export type Callback<T = unknown> = (data: T) => void;

// Hook Return Types
export interface AsyncHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
}

// Lazy Loading Types
export interface LazyComponentConfig {
  fallback?: ComponentType;
  errorBoundary?: ComponentType<{ children: React.ReactNode; fallback?: React.ReactNode }>;
  preload?: boolean;
  timeout?: number;
}

export interface LazyScreenConfig extends LazyComponentConfig {
  name: string;
  component: () => Promise<{ default: ComponentType }>;
  options?: Record<string, unknown>;
}

// Test Types
export interface MockConfig {
  [key: string]: unknown;
}

export interface TestUtils {
  render: (component: React.ReactElement) => {
    getByTestId: (testID: string) => React.ReactElement;
    getByText: (text: string) => React.ReactElement;
    queryByTestId: (testID: string) => React.ReactElement | null;
    queryByText: (text: string) => React.ReactElement | null;
  };
  fireEvent: {
    press: (element: React.ReactElement) => void;
    changeText: (element: React.ReactElement, text: string) => void;
  };
  waitFor: (callback: () => void) => Promise<void>;
}

export {};
