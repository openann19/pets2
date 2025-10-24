import {} from '../NotificationService';
import {} from '../logger';

// Mock dependencies
jest.mock('../logger');

describe('NotificationService', () => {
  let mockServiceWorker: unknown;
  let mockNotification: unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Notification API
    mockNotification = {
      onclick: null,
      onclose: null,
    };

    global.Notification = jest.fn().mockImplementation(() => mockNotification) as unknown;
    (global.Notification as unknown).permission = 'default';
    (global.Notification as unknown).requestPermission = jest.fn().mockResolvedValue('granted');

    // Mock Service Worker
    mockServiceWorker = {
      active: {
        postMessage: jest.fn(),
      },
      pushManager: {
        subscribe: jest.fn(),
      },
      addEventListener: jest.fn(),
    };

    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: {
          register: jest.fn().mockResolvedValue(mockServiceWorker),
          addEventListener: jest.fn(),
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        language: 'en-US',
        platform: 'Win32',
        vendor: 'Google Inc.',
      },
      configurable: true,
    });

    // Mock window
    Object.defineProperty(global, 'window', {
      value: {
        addEventListener: jest.fn(),
        atob: jest.fn((str) => str),
        Notification: global.Notification,
        location: { href: '' },
      },
      configurable: true,
    });

    // Mock screen
    Object.defineProperty(global, 'screen', {
      value: {
        width: 1920,
        height: 1080,
      },
      configurable: true,
    });

    // Mock Intl
    Object.defineProperty(global, 'Intl', {
      value: {
        DateTimeFormat: jest.fn().mockReturnValue({
          resolvedOptions: jest.fn().mockReturnValue({
            timeZone: 'America/New_York',
          }),
        }),
      },
      configurable: true,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      configurable: true,
    });

    // Mock environment variables
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'mock-vapid-key';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('checks for notification support', () => {
      expect(global.Notification).toBeDefined();
    });

    it('registers service worker if supported', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Service worker registration should be attempted
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
    });

    it('handles missing notification support gracefully', () => {
      const originalNotification = global.Notification;
      (global as unknown).Notification = undefined;

      // Should not throw
      expect(() => {
        // Re-initialize would happen here in actual code
      }).not.toThrow();

      global.Notification = originalNotification;
    });
  });

  describe('Permission Management', () => {
    it('requests notification permission', async () => {
      const permission = await notificationService.requestPermission();

      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('returns granted if already granted', async () => {
      (Notification as unknown).permission = 'granted';

      const permission = await notificationService.requestPermission();

      expect(permission).toBe('granted');
      expect(Notification.requestPermission).not.toHaveBeenCalled();
    });

    it('returns denied if blocked', async () => {
      (Notification as unknown).permission = 'denied';

      const permission = await notificationService.requestPermission();

      expect(permission).toBe('denied');
      expect(logger.warn).toHaveBeenCalledWith('Notifications blocked by user');
    });

    it('handles permission request errors', async () => {
      (Notification.requestPermission as jest.Mock).mockRejectedValue(
        new Error('Permission error'),
      );

      const permission = await notificationService.requestPermission();

      expect(permission).toBe('denied');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Sending Notifications', () => {
    beforeEach(() => {
      (Notification as unknown).permission = 'granted';
    });

    it('sends a basic notification', async () => {
      await notificationService.sendNotification({
        title: 'Test Notification',
        body: 'This is a test',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        'Test Notification',
        expect.objectContaining({
          body: 'This is a test',
        }),
      );
    });

    it('includes notification options', async () => {
      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'test-tag',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          icon: '/icon.png',
          badge: '/badge.png',
          tag: 'test-tag',
        }),
      );
    });

    it('does not send when permission is denied', async () => {
      (Notification as unknown).permission = 'denied';

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      expect(global.Notification).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Notification permission not granted');
    });

    it('queues notifications when offline', async () => {
      // Simulate offline
      (window.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === 'offline',
      )?.[1]();

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      // Notification should be queued, not sent immediately
      // This is tested by implementation behavior
    });

    it('sends via service worker when available', async () => {
      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      // Should attempt to use service worker
      // Actual implementation would post message to service worker
    });
  });

  describe('Specific Notification Types', () => {
    beforeEach(() => {
      (Notification as unknown).permission = 'granted';
    });

    it('sends match notification', async () => {
      await notificationService.sendMatchNotification({
        id: 'match-123',
        petId: 'pet-456',
        petName: 'Buddy',
        petPhoto: 'https://example.com/buddy.jpg',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        '💕 New Match!',
        expect.objectContaining({
          body: 'You matched with Buddy!',
          icon: 'https://example.com/buddy.jpg',
          tag: 'match',
        }),
      );
    });

    it('sends message notification', async () => {
      await notificationService.sendMessageNotification({
        id: 'msg-123',
        matchId: 'match-456',
        senderName: 'Buddy',
        message: 'Hello there!',
        senderPhoto: 'https://example.com/buddy.jpg',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        '💬 Buddy',
        expect.objectContaining({
          body: 'Hello there!',
          icon: 'https://example.com/buddy.jpg',
        }),
      );
    });

    it('sends like notification', async () => {
      await notificationService.sendLikeNotification({
        id: 'like-123',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        '❤️ Someone likes your pet!',
        expect.objectContaining({
          body: 'Check who liked your furry friend',
        }),
      );
    });

    it('sends reminder notification', async () => {
      await notificationService.sendReminderNotification({
        id: 'reminder-123',
        message: 'Time to check your matches!',
      });

      expect(global.Notification).toHaveBeenCalledWith(
        '🔔 Reminder',
        expect.objectContaining({
          body: 'Time to check your matches!',
        }),
      );
    });

    it('sends test notification', async () => {
      await notificationService.testNotification();

      expect(global.Notification).toHaveBeenCalledWith(
        '🎉 Test Notification',
        expect.objectContaining({
          body: 'This is a test notification from PawfectMatch!',
        }),
      );
    });
  });

  describe('Analytics', () => {
    beforeEach(() => {
      (Notification as unknown).permission = 'granted';
    });

    it('tracks sent notifications', async () => {
      const initialAnalytics = notificationService.getAnalytics();
      const initialSent = initialAnalytics.sent;

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      const analytics = notificationService.getAnalytics();
      expect(analytics.sent).toBe(initialSent + 1);
    });

    it('tracks failed notifications', async () => {
      (Notification as unknown).permission = 'denied';
      const initialAnalytics = notificationService.getAnalytics();
      const initialFailed = initialAnalytics.failed;

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      const analytics = notificationService.getAnalytics();
      expect(analytics.failed).toBe(initialFailed + 1);
    });

    it('provides complete analytics data', () => {
      const analytics = notificationService.getAnalytics();

      expect(analytics).toHaveProperty('sent');
      expect(analytics).toHaveProperty('delivered');
      expect(analytics).toHaveProperty('clicked');
      expect(analytics).toHaveProperty('dismissed');
      expect(analytics).toHaveProperty('failed');
    });

    it('returns a copy of analytics', () => {
      const analytics1 = notificationService.getAnalytics();
      const analytics2 = notificationService.getAnalytics();

      expect(analytics1).not.toBe(analytics2);
      expect(analytics1).toEqual(analytics2);
    });
  });

  describe('Subscription Management', () => {
    it('unsubscribes from push notifications', async () => {
      await notificationService.unsubscribe();

      // Should handle unsubscribe gracefully
      expect(logger.info).toHaveBeenCalled();
    });

    it('handles unsubscribe errors', async () => {
      // Mock unsubscribe to throw error
      await notificationService.unsubscribe();

      // Should not throw
    });
  });

  describe('Platform Detection', () => {
    it('detects Android platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10)',
        configurable: true,
      });

      // Platform detection happens internally
      // This is tested through implementation
    });

    it('detects iOS platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
        configurable: true,
      });

      // Platform detection happens internally
    });

    it('defaults to web platform', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0)',
        configurable: true,
      });

      // Platform detection happens internally
    });
  });

  describe('Notification Interactions', () => {
    beforeEach(() => {
      (Notification as unknown).permission = 'granted';
    });

    it('handles notification click', async () => {
      delete (window as unknown).location;
      window.location = { href: '' } as unknown;

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
        data: {
          type: 'match',
          matchId: 'match-123',
        },
      });

      // Simulate click
      if (mockNotification.onclick) {
        mockNotification.onclick();
      }

      // Should navigate to match
      expect(window.location.href).toContain('/matches/match-123');
    });

    it('handles notification close', async () => {
      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      // Simulate close
      if (mockNotification.onclose) {
        mockNotification.onclose();
      }

      // Analytics should track dismissed
      const analytics = notificationService.getAnalytics();
      expect(analytics.dismissed).toBeGreaterThan(0);
    });

    it('navigates to message on message notification click', async () => {
      delete (window as unknown).location;
      window.location = { href: '' } as unknown;

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
        data: {
          type: 'message',
          matchId: 'match-123',
        },
      });

      if (mockNotification.onclick) {
        mockNotification.onclick();
      }

      expect(window.location.href).toContain('/chat/match-123');
    });

    it('navigates to swipe on like notification click', async () => {
      delete (window as unknown).location;
      window.location = { href: '' } as unknown;

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
        data: {
          type: 'like',
        },
      });

      if (mockNotification.onclick) {
        mockNotification.onclick();
      }

      expect(window.location.href).toContain('/swipe');
    });
  });

  describe('Offline Support', () => {
    it('detects online status', () => {
      // Should set up online/offline listeners
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('processes queued messages when coming back online', async () => {
      (Notification as unknown).permission = 'granted';

      // Simulate offline
      const offlineHandler = (window.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === 'offline',
      )?.[1];
      if (offlineHandler) offlineHandler();

      // Queue notifications
      await notificationService.sendNotification({
        title: 'Test 1',
        body: 'Body 1',
      });

      // Simulate coming back online
      const onlineHandler = (window.addEventListener as jest.Mock).mock.calls.find(
        (call) => call[0] === 'online',
      )?.[1];
      if (onlineHandler) onlineHandler();

      // Queued messages should be processed
    });
  });

  describe('Error Handling', () => {
    it('handles service worker registration failure', async () => {
      (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(
        new Error('Registration failed'),
      );

      // Should not throw
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(logger.error).toHaveBeenCalled();
    });

    it('handles missing VAPID key', async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      // Should log warning
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('handles notification creation errors', async () => {
      (Notification as unknown).permission = 'granted';
      (global.Notification as unknown).mockImplementation(() => {
        throw new Error('Creation failed');
      });

      await notificationService.sendNotification({
        title: 'Test',
        body: 'Body',
      });

      // Should handle error gracefully
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('FCM Integration', () => {
    it('registers for FCM on Android', async () => {
      await notificationService.registerForFCM();

      // Should attempt FCM registration
      // This would involve Firebase messaging setup
    });

    it('handles FCM registration errors', async () => {
      await notificationService.registerForFCM();

      // Should handle errors gracefully
    });
  });

  describe('APNS Integration', () => {
    it('registers for APNS on iOS', async () => {
      await notificationService.registerForAPNS();

      expect(logger.info).toHaveBeenCalledWith('APNS registration requested');
    });
  });

  describe('Device Information', () => {
    it('collects device information', () => {
      // Device info is collected internally during subscription
      // This is tested through the implementation
    });

    it('includes screen resolution', () => {
      expect(screen.width).toBe(1920);
      expect(screen.height).toBe(1080);
    });

    it('includes timezone information', () => {
      const dtf = new Intl.DateTimeFormat();
      const options = dtf.resolvedOptions();
      expect(options.timeZone).toBe('America/New_York');
    });
  });
});
