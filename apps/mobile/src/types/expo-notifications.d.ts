// Type definitions for expo-notifications
declare module 'expo-notifications' {
  export interface NotificationSubscription {
    remove: () => void;
  }
  
  export type Subscription = NotificationSubscription;
  
  export interface Notification {
    request: {
      identifier: string;
      content: NotificationContent;
      trigger: NotificationTrigger;
    };
    date: number;
  }
  
  export interface NotificationContent {
    title?: string;
    subtitle?: string;
    body?: string;
    data?: Record<string, unknown>;
    sound?: string;
    badge?: number;
    categoryIdentifier?: string;
    threadIdentifier?: string;
    attachments?: NotificationAttachment[];
    launchImageName?: string;
    summaryArgument?: string;
    summaryArgumentCount?: number;
    targetContentIdentifier?: string;
  }
  
  export interface NotificationAttachment {
    identifier: string;
    url: string;
    type: string;
  }
  
  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
  }
  
  export interface NotificationTriggerInput {
    type: 'time' | 'date' | 'location' | 'calendar';
    repeats?: boolean;
    [key: string]: unknown;
  }
  
  export type NotificationTrigger = NotificationTriggerInput;
  
  export function getPermissionsAsync(): Promise<{
    status: 'granted' | 'denied' | 'undetermined';
    android?: {
      importance: number;
    };
    ios?: {
      status: 'granted' | 'denied' | 'undetermined';
    };
  }>;
  
  export function requestPermissionsAsync(): Promise<{
    status: 'granted' | 'denied' | 'undetermined';
    android?: {
      importance: number;
    };
    ios?: {
      status: 'granted' | 'denied' | 'undetermined';
    };
  }>;
  
  export function getExpoPushTokenAsync(): Promise<{
    type: string;
    data: string;
  }>;
  
  export namespace AndroidImportance {
    export const DEFAULT = 3;
    export const HIGH = 4;
    export const LOW = 2;
    export const MAX = 5;
    export const MIN = 1;
    export const NONE = 0;
    export const UNSPECIFIED = -1000;
  }
  
  export function setNotificationChannelAsync(channelId: string, channel: {
    name: string;
    importance: number;
    description?: string;
    enableVibrate?: boolean;
    vibrationPattern?: number[];
    showBadge?: boolean;
    enableLights?: boolean;
    lightColor?: string;
    sound?: string;
    audioAttributes?: Record<string, unknown>;
    lockscreenVisibility?: number;
    bypassDnd?: boolean;
  }): Promise<void>;
  
  export function getBadgeCountAsync(): Promise<number>;
  
  export function setBadgeCountAsync(count: number): Promise<void>;
  
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  
  export function addNotificationReceivedListener(
    listener: (notification: Notification) => void
  ): NotificationSubscription;
  
  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): NotificationSubscription;
  
  export function scheduleNotificationAsync(request: {
    content: NotificationContent;
    trigger?: NotificationTrigger;
  }): Promise<string>;
  
  export function cancelScheduledNotificationAsync(
    notificationIdentifier: string
  ): Promise<void>;
  
  export function setNotificationHandler(handler: {
    handleNotification: (notification: Notification) => {
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    };
    handleSuccess?: (notificationId: string) => void;
    handleError?: (error: Error) => void;
  }): void;
}
