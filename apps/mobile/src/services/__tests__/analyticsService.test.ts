/**
 * Comprehensive tests for Analytics Service
 * 
 * Coverage:
 * - Event tracking
 * - Screen view tracking
 * - User action tracking
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { track, trackScreenView, trackUserAction, AnalyticsEvents } from '../analyticsService';
import { api } from '../api';

// Mock dependencies
jest.mock('../api', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Basic Tracking', () => {
    it('should track event successfully', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('test_event', { property: 'value' });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/analytics/track',
        { event: 'test_event', props: { property: 'value' } }
      );
    });

    it('should track event without properties', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('simple_event');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/analytics/track',
        { event: 'simple_event', props: undefined }
      );
    });

    it('should track screen views', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      trackScreenView('HomeScreen', { tab: 'main' });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/analytics/track',
        { event: 'screen_view', props: { screen: 'HomeScreen', tab: 'main' } }
      );
    });

    it('should track user actions', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      trackUserAction('button_click', { buttonId: 'submit' });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/analytics/track',
        { event: 'user_action', props: { action: 'button_click', buttonId: 'submit' } }
      );
    });
  });

  describe('Happy Path - Event Constants', () => {
    it('should have auth event constants', () => {
      expect(AnalyticsEvents.USER_SIGNED_UP).toBe('user.signed_up');
      expect(AnalyticsEvents.USER_LOGGED_IN).toBe('user.logged_in');
      expect(AnalyticsEvents.USER_LOGGED_OUT).toBe('user.logged_out');
    });

    it('should have premium event constants', () => {
      expect(AnalyticsEvents.PREMIUM_SUBSCRIBED).toBe('premium.subscribed');
      expect(AnalyticsEvents.PREMIUM_CANCELLED).toBe('premium.cancelled');
      expect(AnalyticsEvents.PREMIUM_FEATURE_USED).toBe('premium.feature_used');
    });

    it('should have swipe event constants', () => {
      expect(AnalyticsEvents.SWIPE_RIGHT).toBe('swipe.right');
      expect(AnalyticsEvents.SWIPE_LEFT).toBe('swipe.left');
      expect(AnalyticsEvents.SWIPE_SUPERLIKE).toBe('swipe.superlike');
    });

    it('should have match event constants', () => {
      expect(AnalyticsEvents.MATCH_CREATED).toBe('match.created');
      expect(AnalyticsEvents.MATCH_OPENED).toBe('match.opened');
      expect(AnalyticsEvents.MATCH_BLOCKED).toBe('match.blocked');
    });

    it('should have chat event constants', () => {
      expect(AnalyticsEvents.MESSAGE_SENT).toBe('message.sent');
      expect(AnalyticsEvents.MESSAGE_RECEIVED).toBe('message.received');
      expect(AnalyticsEvents.VOICE_NOTE_SENT).toBe('voice_note.sent');
    });

    it('should have profile event constants', () => {
      expect(AnalyticsEvents.PROFILE_VIEWED).toBe('profile.viewed');
      expect(AnalyticsEvents.PROFILE_EDITED).toBe('profile.edited');
      expect(AnalyticsEvents.PHOTO_UPLOADED).toBe('photo.uploaded');
    });

    it('should have map event constants', () => {
      expect(AnalyticsEvents.ACTIVITY_STARTED).toBe('activity.started');
      expect(AnalyticsEvents.ACTIVITY_ENDED).toBe('activity.ended');
      expect(AnalyticsEvents.PIN_LIKED).toBe('pin.liked');
      expect(AnalyticsEvents.PIN_COMMENTED).toBe('pin.commented');
    });

    it('should have settings event constants', () => {
      expect(AnalyticsEvents.SETTINGS_UPDATED).toBe('settings.updated');
      expect(AnalyticsEvents.NOTIFICATION_PREFERENCE_CHANGED).toBe('notification.preference_changed');
    });
  });

  describe('Error Handling', () => {
    it('should handle tracking errors gracefully', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(track('error_event')).resolves.not.toThrow();
    });

    it('should handle screen view errors gracefully', () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      expect(() => trackScreenView('ErrorScreen')).not.toThrow();
    });

    it('should handle user action errors gracefully', () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      expect(() => trackUserAction('error_action')).not.toThrow();
    });

    it('should handle null properties', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('null_event', null as any);

      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string events', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('');

      expect(mockApi.post).toHaveBeenCalled();
    });

    it('should handle very long property names', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      const longProps = { [`property_${'x'.repeat(1000)}`]: 'value' };

      await track('long_event', longProps);

      expect(mockApi.post).toHaveBeenCalled();
    });

    it('should handle nested objects in properties', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      const nestedProps = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
        pets: ['Fluffy', 'Max'],
      };

      await track('nested_event', nestedProps);

      expect(mockApi.post).toHaveBeenCalled();
    });

    it('should handle array properties', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('array_event', { items: [1, 2, 3], tags: ['tag1', 'tag2'] });

      expect(mockApi.post).toHaveBeenCalled();
    });

    it('should handle undefined screen name gracefully', () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      trackScreenView(undefined as any);

      expect(mockApi.post).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should integrate with API service', async () => {
      mockApi.post.mockResolvedValueOnce(undefined);

      await track('integration_event', { test: true });

      expect(mockApi.post).toHaveBeenCalledWith(
        '/admin/analytics/track',
        expect.any(Object)
      );
    });

    it('should allow chaining multiple track calls', async () => {
      mockApi.post.mockResolvedValue(undefined);

      await Promise.all([
        track('event1', { id: 1 }),
        track('event2', { id: 2 }),
        track('event3', { id: 3 }),
      ]);

      expect(mockApi.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for event names', () => {
      const events: string[] = [
        AnalyticsEvents.USER_SIGNED_UP,
        AnalyticsEvents.PREMIUM_SUBSCRIBED,
        AnalyticsEvents.SWIPE_RIGHT,
      ];

      expect(events.every(e => typeof e === 'string')).toBe(true);
    });

    it('should maintain type safety for properties', async () => {
      interface EventProps {
        userId?: string;
        timestamp?: number;
      }

      mockApi.post.mockResolvedValueOnce(undefined);

      await track('typed_event', { userId: '123', timestamp: Date.now() });

      expect(mockApi.post).toHaveBeenCalled();
    });
  });
});
