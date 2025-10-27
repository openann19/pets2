/**
 * Event Type Definitions
 * Provides type safety for React Native events and handlers
 */

import type { 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  LayoutChangeEvent,
  PressableStateCallbackType,
  GestureResponderEvent
} from 'react-native';

/**
 * Scroll event handler types
 */
export type ScrollEventHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

/**
 * Layout event handler types
 */
export type LayoutEventHandler = (event: LayoutChangeEvent) => void;

/**
 * Press event handler types
 */
export type PressEventHandler = (event: GestureResponderEvent) => void;
export type LongPressEventHandler = (event: GestureResponderEvent) => void;

/**
 * Pressable state callback type
 */
export type PressableStateCallback = (state: PressableStateCallbackType) => void;

/**
 * Form event types
 */
export interface FormSubmitEvent extends Event {
  preventDefault(): void;
}

export type FormSubmitHandler<T = Record<string, unknown>> = (
  values: T
) => void | Promise<void>;

export type FormEventHandler<T = FormSubmitEvent> = (event?: T) => void | Promise<void>;

/**
 * Input change event types
 */
export type TextInputChangeHandler = (text: string) => void;
export type TextInputSubmitHandler = () => void;
export type TextInputFocusHandler = () => void;
export type TextInputBlurHandler = () => void;

/**
 * Navigation event types
 */
export interface NavigationEventData {
  type: string;
  target?: string;
}

export type NavigationEventHandler = (data: NavigationEventData) => void;

/**
 * Gesture event types
 */
export interface SwipeGestureData {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
}

export type SwipeGestureHandler = (data: SwipeGestureData) => void;

export interface PanGestureData {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

export type PanGestureHandler = (data: PanGestureData) => void;

export interface PinchGestureData {
  scale: number;
  velocity: number;
  focalX: number;
  focalY: number;
}

export type PinchGestureHandler = (data: PinchGestureData) => void;

/**
 * Animation event types
 */
export interface AnimationEventData {
  finished: boolean;
  value?: number;
}

export type AnimationEventHandler = (data: AnimationEventData) => void;

/**
 * Media event types
 */
export interface MediaLoadEventData {
  duration: number;
  width?: number;
  height?: number;
}

export type MediaLoadEventHandler = (data: MediaLoadEventData) => void;

export interface MediaErrorEventData {
  error: string;
  code?: number;
}

export type MediaErrorEventHandler = (data: MediaErrorEventData) => void;

/**
 * Network event types
 */
export interface NetworkEventData {
  isConnected: boolean;
  type?: string;
  isInternetReachable?: boolean;
}

export type NetworkEventHandler = (data: NetworkEventData) => void;

/**
 * Permission event types
 */
export interface PermissionEventData {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain?: boolean;
}

export type PermissionEventHandler = (data: PermissionEventData) => void;

/**
 * Notification event types
 */
export interface NotificationEventData {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export type NotificationEventHandler = (data: NotificationEventData) => void;

/**
 * Error event types
 */
export interface ErrorEventData {
  message: string;
  stack?: string;
  code?: string | number;
}

export type ErrorEventHandler = (data: ErrorEventData) => void;

/**
 * Generic event handler type
 */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * Async event handler type
 */
export type AsyncEventHandler<T = unknown> = (data: T) => Promise<void>;

/**
 * Event listener types
 */
export interface EventListener<T = unknown> {
  event: string;
  handler: EventHandler<T>;
}

export interface AsyncEventListener<T = unknown> {
  event: string;
  handler: AsyncEventHandler<T>;
}
