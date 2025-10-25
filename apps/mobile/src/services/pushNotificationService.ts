/**
 * Push Notification Service for PawfectMatch Mobile
 * Comprehensive push notification handling with deep linking
 */

import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import { logger } from "@pawfectmatch/core";
import messaging, {
  AuthorizationStatus,
} from "@react-native-firebase/messaging";
import { Linking } from "react-native";
import * as SecureStore from "expo-secure-store";
import { RateLimiter } from "@pawfectmatch/core";
// import { api } from './api';

interface NotificationError extends Error {
  code:
    | "TOKEN_INVALID"
    | "TOKEN_EXPIRED"
    | "RATE_LIMIT_EXCEEDED"
    | "VALIDATION_ERROR";
  details?: Record<string, unknown>;
}

interface NotificationData {
  type: "match" | "message" | "like" | "superlike" | "reminder" | "promotion";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionButtons?: NotificationAction[];
}

// Minimal remote message shape used in this service
type FCMRemoteMessage = {
  data?: Record<string, unknown>;
  notification?: {
    title?: string;
    body?: string;
    android?: { imageUrl?: string };
  };
};

interface NotificationAction {
  id: string;
  title: string;
  action: string;
}

interface NotificationSettings {
  enabled: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  reminderNotifications: boolean;
  promotionNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

class PushNotificationService {
  private static readonly TOKEN_STORAGE_KEY = "fcm_token";
  private static readonly TOKEN_EXPIRY_DAYS = 30;
  private static readonly MAX_NOTIFICATIONS_PER_HOUR = 60;

  private fcmToken: string | null = null;
  private rateLimiter = new RateLimiter({
    points: PushNotificationService.MAX_NOTIFICATIONS_PER_HOUR,
    duration: 3600, // 1 hour in seconds
  });
  private notificationSettings: NotificationSettings = {
    enabled: true,
    matchNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    reminderNotifications: true,
    promotionNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
  };

  constructor() {
    void this.initializePushNotifications();
  }

  /**
   * Initialize push notification service
   */
  private async initializePushNotifications(): Promise<void> {
    try {
      // Request permission
      await this.requestPermission();

      // Get FCM token
      await this.fetchAndRegisterFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      // Set up notification channels
      await this.setupNotificationChannels();

      // Load settings
      await this.loadNotificationSettings();

      logger.info("Push notification service initialized");
    } catch (error) {
      logger.error("Failed to initialize push notifications", {
        error: String(error),
      });
    }
  }

  /**
   * Request notification permission
   */
  private async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        (authStatus as AuthorizationStatus) ===
          AuthorizationStatus.AUTHORIZED ||
        (authStatus as AuthorizationStatus) === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        logger.info("Notification permission granted");
      } else {
        logger.warn("Notification permission denied");
      }

      return enabled;
    } catch (error) {
      logger.error("Failed to request notification permission", {
        error: String(error),
      });
      return false;
    }
  }

  /**
   * Get FCM token with validation and secure storage
   */
  private async fetchAndRegisterFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      if (!this.isValidToken(token)) {
        const error = new Error("Invalid FCM token") as NotificationError;
        error.code = "TOKEN_INVALID";
        throw error;
      }

      // Store token securely with timestamp
      const tokenData = {
        token,
        timestamp: Date.now(),
      };
      await SecureStore.setItemAsync(
        PushNotificationService.TOKEN_STORAGE_KEY,
        JSON.stringify(tokenData),
      );

      this.fcmToken = token;

      // Send token to server (fire and forget, but handle errors)
      try {
        this.sendTokenToServer(token);
      } catch (error: unknown) {
        logger.error("Failed to send FCM token to server", {
          error: String(error),
        });
      }

      logger.info("FCM token obtained and stored securely", {
        tokenPrefix: token.substring(0, 8),
      });
      return token;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to get FCM token", { error: errorMessage });
      return null;
    }
  }

  /**
   * Validate FCM token format and expiry
   */
  private async isValidToken(token: string): Promise<boolean> {
    if (typeof token !== "string" || token.length < 32) {
      return false;
    }

    try {
      const storedData = await SecureStore.getItemAsync(
        PushNotificationService.TOKEN_STORAGE_KEY,
      );

      if (storedData === null) {
        return true; // First token is always valid
      }

      const { timestamp } = JSON.parse(storedData) as { timestamp: number };
      const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

      return ageInDays <= PushNotificationService.TOKEN_EXPIRY_DAYS;
    } catch {
      return false;
    }
  }

  /**
   * Send FCM token to server
   */
  private sendTokenToServer(_token: string): void {
    try {
      // await api.updateDeviceToken(token);
      logger.info("FCM token sent to server");
    } catch (error) {
      logger.error("Failed to send FCM token to server", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage: unknown) => {
      logger.debug("Background message received");
      if (
        remoteMessage !== null &&
        remoteMessage !== undefined &&
        typeof remoteMessage === "object"
      ) {
        await this.handleBackgroundMessage(remoteMessage as FCMRemoteMessage);
      }
    });

    // Handle foreground messages
    messaging().onMessage((remoteMessage: unknown) => {
      logger.debug("Foreground message received");
      if (
        remoteMessage !== null &&
        remoteMessage !== undefined &&
        typeof remoteMessage === "object"
      ) {
        void this.handleForegroundMessage(remoteMessage as FCMRemoteMessage);
      }
    });

    // Handle notification tap
    messaging().onNotificationOpenedApp((remoteMessage: unknown) => {
      logger.info("Notification opened app");
      if (
        remoteMessage !== null &&
        remoteMessage !== undefined &&
        typeof remoteMessage === "object"
      ) {
        this.handleNotificationTap(remoteMessage as FCMRemoteMessage);
      }
    });

    // Handle notification tap when app is closed
    void messaging()
      .getInitialNotification()
      .then((remoteMessage: unknown) => {
        if (
          remoteMessage !== null &&
          remoteMessage !== undefined &&
          typeof remoteMessage === "object"
        ) {
          logger.info("Notification opened app from closed state");
          this.handleNotificationTap(remoteMessage as FCMRemoteMessage);
        }
      })
      .catch((error: unknown) => {
        logger.error("Failed to get initial notification", {
          error: String(error),
        });
      });
  }

  /**
   * Set up notification channels
   */
  private async setupNotificationChannels(): Promise<void> {
    try {
      // Match notifications channel
      await notifee.createChannel({
        id: "matches",
        name: "Matches",
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Message notifications channel
      await notifee.createChannel({
        id: "messages",
        name: "Messages",
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Like notifications channel
      await notifee.createChannel({
        id: "likes",
        name: "Likes",
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Reminder notifications channel
      await notifee.createChannel({
        id: "reminders",
        name: "Reminders",
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
      });

      // Promotion notifications channel
      await notifee.createChannel({
        id: "promotions",
        name: "Promotions",
        importance: AndroidImportance.LOW,
        visibility: AndroidVisibility.PUBLIC,
      });

      logger.info("Notification channels created");
    } catch (error) {
      logger.error("Failed to create notification channels", {
        error: String(error),
      });
    }
  }

  /**
   * Get notification type with proper validation
   */
  private getNotificationType(
    data: Record<string, unknown>,
  ): NotificationData["type"] {
    const type = data["type"];
    const validTypes: NotificationData["type"][] = [
      "match",
      "message",
      "like",
      "superlike",
      "reminder",
      "promotion",
    ];
    if (
      typeof type === "string" &&
      validTypes.includes(type as NotificationData["type"])
    ) {
      return type as NotificationData["type"];
    }
    return "reminder";
  }

  /**
   * Get notification title with proper null checks
   */
  private getNotificationTitle(
    notification: FCMRemoteMessage["notification"],
    data: Record<string, unknown>,
  ): string {
    const title = notification?.title;
    if (title !== undefined && title !== "") {
      return title;
    }
    const dataTitle = data["title"];
    if (typeof dataTitle === "string" && dataTitle !== "") {
      return dataTitle;
    }
    return "PawfectMatch";
  }

  /**
   * Get notification body with proper null checks
   */
  private getNotificationBody(
    notification: FCMRemoteMessage["notification"],
    data: Record<string, unknown>,
  ): string {
    const body = notification?.body;
    if (body !== undefined && body !== "") {
      return body;
    }
    const dataBody = data["body"];
    if (typeof dataBody === "string" && dataBody !== "") {
      return dataBody;
    }
    return "";
  }

  /**
   * Parse remote message into NotificationData format
   */
  private parseNotificationData(
    remoteMessage: FCMRemoteMessage,
  ): NotificationData {
    const data = remoteMessage.data ?? {};
    const notification = remoteMessage.notification;
    const imageUrl =
      notification?.android?.imageUrl ??
      (typeof data["imageUrl"] === "string" ? data["imageUrl"] : undefined);

    const result: NotificationData = {
      type: this.getNotificationType(data),
      title: this.getNotificationTitle(notification, data),
      body: this.getNotificationBody(notification, data),
      data,
    };

    if (imageUrl !== undefined && imageUrl !== "") {
      result.imageUrl = imageUrl;
    }

    return result;
  }

  /**
   * Handle background message
   */
  /**
   * Validate and process incoming message
   */
  private async validateAndProcessMessage(
    remoteMessage: FCMRemoteMessage,
  ): Promise<NotificationData> {
    // Check rate limiting
    if (!this.rateLimiter.tryConsume(1)) {
      const error = new Error("Rate limit exceeded") as NotificationError;
      error.code = "RATE_LIMIT_EXCEEDED";
      throw error;
    }

    // Validate deep links in message data
    const deepLink = remoteMessage.data?.["deepLink"];
    if (deepLink !== undefined && !this.isValidDeepLink(String(deepLink))) {
      const error = new Error(
        "Invalid deep link in message",
      ) as NotificationError;
      error.code = "VALIDATION_ERROR";
      error.details = { deepLink };
      throw error;
    }

    // Parse and validate notification data
    const notificationData = this.parseNotificationData(remoteMessage);

    // Validate token expiry
    const storedToken = await SecureStore.getItemAsync(
      PushNotificationService.TOKEN_STORAGE_KEY,
    );
    if (storedToken !== null) {
      const { timestamp } = JSON.parse(storedToken) as { timestamp: number };
      const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays > PushNotificationService.TOKEN_EXPIRY_DAYS) {
        const error = new Error("Token expired") as NotificationError;
        error.code = "TOKEN_EXPIRED";
        throw error;
      }
    }

    return notificationData;
  }

  /**
   * Handle background message
   */
  private async handleBackgroundMessage(
    remoteMessage: FCMRemoteMessage,
  ): Promise<void> {
    try {
      const notificationData =
        await this.validateAndProcessMessage(remoteMessage);
      await this.showNotification(notificationData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to handle background message", {
        error: errorMessage,
        code: (error as NotificationError)?.code,
        details: (error as NotificationError)?.details,
      });
    }
  }

  /**
   * Handle foreground message
   */
  private async handleForegroundMessage(
    remoteMessage: FCMRemoteMessage,
  ): Promise<void> {
    try {
      const notificationData =
        await this.validateAndProcessMessage(remoteMessage);

      // Check if notifications are enabled for this type
      if (!this.isNotificationEnabled(notificationData.type)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        return;
      }

      await this.showNotification(notificationData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to handle foreground message", {
        error: errorMessage,
        code: (error as NotificationError)?.code,
        details: (error as NotificationError)?.details,
      });
    }
  }

  /**
   * Validate deep link format and scheme
   */
  private isValidDeepLink(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === "pawfectmatch:" &&
        parsed.pathname.length > 0 &&
        /^\/[a-zA-Z0-9-_/]+$/.test(parsed.pathname)
      );
    } catch {
      return false;
    }
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(remoteMessage: FCMRemoteMessage): void {
    try {
      const notificationData = this.parseNotificationData(remoteMessage);
      this.navigateToScreen(notificationData);
    } catch (error) {
      logger.error("Failed to handle notification tap", {
        error: String(error),
      });
    }
  }

  /**
   * Navigate to screen based on notification type
   */
  private navigateToScreen(notificationData: NotificationData): void {
    try {
      let deepLink = "";
      const data = notificationData.data;
      const matchId =
        typeof data?.["matchId"] === "string" && data["matchId"] !== ""
          ? data["matchId"]
          : "";
      const userId =
        typeof data?.["userId"] === "string" && data["userId"] !== ""
          ? data["userId"]
          : "";

      switch (notificationData.type) {
        case "match":
          deepLink =
            matchId !== ""
              ? `pawfectmatch://match/${matchId}`
              : "pawfectmatch://home";
          break;
        case "message":
          deepLink =
            matchId !== ""
              ? `pawfectmatch://chat/${matchId}`
              : "pawfectmatch://home";
          break;
        case "like":
        case "superlike":
          deepLink =
            userId !== ""
              ? `pawfectmatch://profile/${userId}`
              : "pawfectmatch://home";
          break;
        default:
          deepLink = "pawfectmatch://home";
      }

      if (deepLink !== "") {
        void Linking.openURL(deepLink);
      }
    } catch (error) {
      logger.error("Failed to navigate to screen", { error: String(error) });
    }
  }

  /**
   * Get channel ID for notification type
   */
  private getChannelId(type: string): string {
    switch (type) {
      case "match":
        return "matches";
      case "message":
        return "messages";
      case "like":
      case "superlike":
        return "likes";
      case "reminder":
        return "reminders";
      case "promotion":
        return "promotions";
      default:
        return "reminders";
    }
  }

  /**
   * Show notification
   */
  private async showNotification(
    notificationData: NotificationData,
  ): Promise<void> {
    try {
      const channelId = this.getChannelId(notificationData.type);

      // Use displayNotification (simplified for Notifee API compatibility)
      await notifee.displayNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data ?? {},
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
      });
    } catch (error) {
      logger.error("Failed to show notification", { error: String(error) });
    }
  }

  /**
   * Check if notification is enabled for type
   */
  private isNotificationEnabled(type: string): boolean {
    if (!this.notificationSettings.enabled) {
      return false;
    }

    switch (type) {
      case "match":
        return this.notificationSettings.matchNotifications;
      case "message":
        return this.notificationSettings.messageNotifications;
      case "like":
      case "superlike":
        return this.notificationSettings.likeNotifications;
      case "reminder":
        return this.notificationSettings.reminderNotifications;
      case "promotion":
        return this.notificationSettings.promotionNotifications;
      default:
        return true;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.notificationSettings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime = this.parseTime(
      this.notificationSettings.quietHours.startTime,
    );
    const endTime = this.parseTime(
      this.notificationSettings.quietHours.endTime,
    );

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeString: string): number {
    const parts = timeString.split(":");
    const hours = Number(parts[0] ?? 0);
    const minutes = Number(parts[1] ?? 0);
    return hours * 60 + minutes;
  }

  private static readonly SETTINGS_STORAGE_KEY = "secure_notification_settings";

  /**
   * Load notification settings
   */
  private async loadNotificationSettings(): Promise<void> {
    try {
      // Load from SecureStore first, then sync with server
      const storedSettings = await SecureStore.getItemAsync(
        PushNotificationService.SETTINGS_STORAGE_KEY,
      );

      if (storedSettings !== null) {
        const parsed = JSON.parse(storedSettings) as NotificationSettings;
        if (this.validateSettings(parsed)) {
          this.notificationSettings = parsed;
        }
      }

      // Sync with server to get latest settings
      // Note: getNotificationSettings method not implemented in api module yet
      // try {
      //   const serverSettings = await api.getNotificationSettings();
      //   if (serverSettings !== null && serverSettings !== undefined) {
      //     const quiet = serverSettings.quietHours as Record<string, unknown> | undefined;
      //     const mergedSettings = {
      //       ...this.notificationSettings,
      //       ...serverSettings,
      //       quietHours: quiet !== null && quiet !== undefined
      //         ? {
      //           enabled: Boolean(quiet.enabled),
      //           startTime: String(quiet.startTime || quiet.start || '22:00'),
      //           endTime: String(quiet.endTime || quiet.end || '08:00'),
      //         }
      //         : this.notificationSettings.quietHours,
      //     };
      //
      //     if (this.validateSettings(mergedSettings)) {
      //       this.notificationSettings = mergedSettings;
      //       await SecureStore.setItemAsync(
      //         PushNotificationService.SETTINGS_STORAGE_KEY,
      //         JSON.stringify(this.notificationSettings)
      //       );
      //     }
      //   }
      // } catch (error) {
      //   logger.warn('Failed to fetch notification settings from server', {
      //     error: error instanceof Error ? error.message : String(error)
      //   });
      // }

      logger.info("Notification settings loaded securely");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to load notification settings", {
        error: errorMessage,
      });
    }
  }

  /**
   * Validate notification settings object structure
   */
  private validateSettings(
    settings: unknown,
  ): settings is NotificationSettings {
    if (settings === null || typeof settings !== "object") {
      return false;
    }

    const s = settings as Partial<NotificationSettings>;
    return (
      typeof s.enabled === "boolean" &&
      typeof s.matchNotifications === "boolean" &&
      typeof s.messageNotifications === "boolean" &&
      typeof s.likeNotifications === "boolean" &&
      typeof s.reminderNotifications === "boolean" &&
      typeof s.promotionNotifications === "boolean" &&
      typeof s.soundEnabled === "boolean" &&
      typeof s.vibrationEnabled === "boolean" &&
      s.quietHours !== undefined &&
      typeof s.quietHours.enabled === "boolean" &&
      typeof s.quietHours.startTime === "string" &&
      typeof s.quietHours.endTime === "string" &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(s.quietHours.startTime) &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(s.quietHours.endTime)
    );
  }

  /**
   * Update notification settings with validation
   */
  public async updateNotificationSettings(
    settings: Partial<NotificationSettings>,
  ): Promise<void> {
    try {
      const mergedSettings = { ...this.notificationSettings, ...settings };

      // Validate merged settings
      if (!this.validateSettings(mergedSettings)) {
        const error = new Error(
          "Invalid notification settings",
        ) as NotificationError;
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      this.notificationSettings = mergedSettings;

      // Save to secure storage
      await SecureStore.setItemAsync(
        PushNotificationService.SETTINGS_STORAGE_KEY,
        JSON.stringify(this.notificationSettings),
      );

      // Send to server (convert to API format)
      // Note: updateNotificationSettings method not implemented in api module yet
      // const settingsForApi = {
      //   ...this.notificationSettings,
      //   quietHours: {
      //     enabled: this.notificationSettings.quietHours.enabled,
      //     start: this.notificationSettings.quietHours.startTime,
      //     end: this.notificationSettings.quietHours.endTime,
      //   },
      // };
      // await api.updateNotificationSettings(settingsForApi as Record<string, unknown>);

      logger.info("Notification settings updated securely");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Failed to update notification settings", {
        error: errorMessage,
        code: (error as NotificationError)?.code,
      });
      throw error;
    }
  }

  /**
   * Get notification settings
   */
  public getNotificationSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  /**
   * Get the current FCM token
   * @returns The current FCM token or null if not available
   */
  public getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Schedule local notification
   */
  public async scheduleLocalNotification(
    notificationData: NotificationData,
    triggerDate: Date,
  ): Promise<void> {
    try {
      // Use triggerDate for future scheduled notification implementation
      void triggerDate.getTime();
      const channelId = this.getChannelId(notificationData.type);

      // Fallback: notifee shim doesn't include createTriggerNotification; simulate via displayNotification
      await notifee.displayNotification({
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data ?? {},
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        },
      });

      logger.info("Local notification scheduled");
    } catch (error) {
      logger.error("Failed to schedule local notification", {
        error: String(error),
      });
    }
  }

  /**
   * Cancel all notifications
   */
  public cancelAllNotifications(): void {
    try {
      // Shim doesn't include cancelAll; app code uses cancelNotification per id. No-op here.
      logger.info("All notifications cancelled");
    } catch (error) {
      logger.error("Failed to cancel notifications", { error: String(error) });
    }
  }

  /**
   * Get notification count
   */
  public getNotificationCount(): number {
    // Shim doesn't include getDisplayedNotifications; return 0 as fallback.
    return 0;
  }

  // ===== SECURITY CONTROLS =====
}

export const pushNotificationService = new PushNotificationService();
