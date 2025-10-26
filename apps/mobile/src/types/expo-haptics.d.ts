// Type definitions for expo-haptics
declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 1,
    Medium = 2,
    Heavy = 3,
  }

  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }

  export enum SelectionFeedbackType {
    Selection = 'selection',
  }

  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}

