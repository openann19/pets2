// Ambient module shims for native libraries to unblock typechecking during setup
// Remove these once the real native dependencies are installed and configured.

declare module '@react-native-firebase/messaging' {
  export interface RemoteMessage {
    messageId?: string;
    data?: { [key: string]: string };
    notification?: {
      title?: string;
      body?: string;
      imageUrl?: string;
    };
    from?: string;
    collapseKey?: string;
    messageType?: string;
  }

  export interface Messaging {
    getToken(): Promise<string>;
    requestPermission(): Promise<number>;
    onMessage(handler: (message: RemoteMessage) => void): () => void;
    onNotificationOpenedApp(handler: (message: RemoteMessage) => void): () => void;
    getInitialNotification(): Promise<RemoteMessage | null>;
    setBackgroundMessageHandler(handler: (message: RemoteMessage) => Promise<void>): void;
  }

  const messaging: () => Messaging;
  export default messaging;

  export enum AuthorizationStatus {
    NOT_DETERMINED = -1,
    DENIED = 0,
    AUTHORIZED = 1,
    PROVISIONAL = 2,
  }
}

declare module '@notifee/react-native' {
  export enum AndroidImportance {
    NONE = 0,
    MIN = 1,
    LOW = 2,
    DEFAULT = 3,
    HIGH = 4,
  }

  export enum AndroidVisibility {
    PRIVATE = 0,
    PUBLIC = 1,
    SECRET = -1,
  }

  export interface NotificationAndroid {
    channelId: string;
    importance?: AndroidImportance;
    visibility?: AndroidVisibility;
    pressAction?: {
      id: string;
      launchActivity?: string;
    };
  }

  export interface Notification {
    title?: string;
    body?: string;
    data?: { [key: string]: unknown };
    android?: NotificationAndroid;
    ios?: {
      sound?: string;
      badgeCount?: number;
    };
  }

  export interface NotifeeInstance {
    displayNotification(notification: Notification): Promise<string>;
    cancelNotification(notificationId: string): Promise<void>;
    createChannel(channel: {
      id: string;
      name: string;
      importance?: AndroidImportance;
      visibility?: AndroidVisibility;
    }): Promise<string>;
    requestPermission(): Promise<{ authorizationStatus: number }>;
  }

  const notifee: NotifeeInstance;
  export default notifee;
}
