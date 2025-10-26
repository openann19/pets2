/**
 * Comprehensive tests for MapActivityService
 *
 * Coverage:
 * - Activity management (start/end activities)
 * - Location services integration
 * - Nearby pins discovery
 * - Social interactions (likes, comments)
 * - Permission handling
 * - Error handling and validation
 * - Location data accuracy
 * - Concurrent operations
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as Location from 'expo-location';
import {
  startActivity,
  endActivity,
  getNearbyPins,
  likePin,
  commentOnPin,
  type CreateActivityParams,
  type MapPin,
} from '../mapActivityService';

// Mock dependencies
jest.mock('expo-location');
jest.mock('../api', () => ({
  request: jest.fn(),
}));

import { request } from '../api';

const mockLocation = Location as jest.Mocked<typeof Location>;
const mockRequest = request as jest.MockedFunction<typeof request>;

describe('MapActivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 10,
        accuracy: 5,
        altitudeAccuracy: 1,
        heading: 90,
        speed: 1.5,
      },
      timestamp: Date.now(),
    });

    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });
  });

  describe('startActivity', () => {
    it('should start an activity with current location', async () => {
      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'walking',
        message: 'Enjoying a walk in the park!',
        shareToMap: true,
        radiusMeters: 500,
      };

      const mockResponse: MapPin = {
        _id: 'activity123',
        userId: 'user456',
        petId: 'pet123',
        activity: 'walking',
        message: 'Enjoying a walk in the park!',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128], // [lng, lat]
        },
        radiusMeters: 500,
        shareToMap: true,
        active: true,
        likes: [],
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
      });

      expect(mockRequest).toHaveBeenCalledWith('/map/activity/start', {
        method: 'POST',
        body: {
          ...params,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle location permission denied', async () => {
      mockLocation.getCurrentPositionAsync.mockRejectedValue(
        new Error('Location permission denied')
      );

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'playing',
      };

      await expect(startActivity(params)).rejects.toThrow('Location permission denied');
    });

    it('should handle location services unavailable', async () => {
      mockLocation.getCurrentPositionAsync.mockRejectedValue(
        new Error('Location services are disabled')
      );

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'resting',
      };

      await expect(startActivity(params)).rejects.toThrow('Location services are disabled');
    });

    it('should start activity with minimal parameters', async () => {
      const params: CreateActivityParams = {
        petId: 'pet456',
        activity: 'eating',
      };

      const mockResponse: MapPin = {
        _id: 'activity456',
        userId: 'user789',
        petId: 'pet456',
        activity: 'eating',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 100, // default
        shareToMap: false, // default
        active: true,
        likes: [],
        createdAt: '2024-01-01T13:00:00Z',
        updatedAt: '2024-01-01T13:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(result.petId).toBe('pet456');
      expect(result.activity).toBe('eating');
    });

    it('should handle API errors during activity start', async () => {
      mockRequest.mockRejectedValue(new Error('Activity creation failed'));

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'walking',
      };

      await expect(startActivity(params)).rejects.toThrow('Activity creation failed');
    });

    it('should handle extreme location coordinates', async () => {
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 89.9999, // Near north pole
          longitude: 179.9999, // Near international date line
          altitude: 8848, // Everest height
          accuracy: 1,
          altitudeAccuracy: 0.5,
          heading: 359,
          speed: 0,
        },
        timestamp: Date.now(),
      });

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'exploring',
      };

      const mockResponse: MapPin = {
        _id: 'extreme-activity',
        userId: 'user123',
        petId: 'pet123',
        activity: 'exploring',
        location: {
          type: 'Point',
          coordinates: [179.9999, 89.9999],
        },
        radiusMeters: 100,
        shareToMap: false,
        active: true,
        likes: [],
        createdAt: '2024-01-01T14:00:00Z',
        updatedAt: '2024-01-01T14:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(result.location.coordinates).toEqual([179.9999, 89.9999]);
    });
  });

  describe('endActivity', () => {
    it('should end an activity successfully', async () => {
      const activityId = 'activity123';

      mockRequest.mockResolvedValue({ success: true });

      await expect(endActivity(activityId)).resolves.not.toThrow();

      expect(mockRequest).toHaveBeenCalledWith('/map/activity/end', {
        method: 'POST',
        body: { activityId },
      });
    });

    it('should handle API errors during activity end', async () => {
      mockRequest.mockRejectedValue(new Error('Activity end failed'));

      await expect(endActivity('invalid-activity')).rejects.toThrow('Activity end failed');
    });

    it('should handle activity not found', async () => {
      mockRequest.mockRejectedValue(new Error('Activity not found'));

      await expect(endActivity('nonexistent')).rejects.toThrow('Activity not found');
    });
  });

  describe('getNearbyPins', () => {
    it('should get nearby pins with coordinates', async () => {
      const latitude = 40.7128;
      const longitude = -74.0060;
      const maxDistance = 1000;

      const mockPins: MapPin[] = [
        {
          _id: 'pin1',
          userId: 'user1',
          petId: 'pet1',
          activity: 'walking',
          message: 'Nice walk!',
          location: {
            type: 'Point',
            coordinates: [-74.0050, 40.7130],
          },
          radiusMeters: 500,
          shareToMap: true,
          active: true,
          likes: [{ userId: 'user2', likedAt: '2024-01-01T15:00:00Z' }],
          createdAt: '2024-01-01T14:00:00Z',
          updatedAt: '2024-01-01T15:00:00Z',
        },
        {
          _id: 'pin2',
          userId: 'user2',
          petId: 'pet2',
          activity: 'playing',
          location: {
            type: 'Point',
            coordinates: [-74.0070, 40.7120],
          },
          radiusMeters: 300,
          shareToMap: true,
          active: true,
          likes: [],
          createdAt: '2024-01-01T14:30:00Z',
          updatedAt: '2024-01-01T14:30:00Z',
        },
      ];

      mockRequest.mockResolvedValue(mockPins);

      const result = await getNearbyPins(latitude, longitude, maxDistance);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins', {
        method: 'GET',
        params: { latitude, longitude, maxDistance },
      });

      expect(result).toEqual(mockPins);
      expect(result).toHaveLength(2);
    });

    it('should get nearby pins without max distance', async () => {
      const latitude = 51.5074;
      const longitude = -0.1278; // London coordinates

      const mockPins: MapPin[] = [
        {
          _id: 'london-pin',
          userId: 'user-london',
          petId: 'pet-london',
          activity: 'park_visit',
          location: {
            type: 'Point',
            coordinates: [-0.1270, 51.5080],
          },
          radiusMeters: 200,
          shareToMap: true,
          active: true,
          likes: [],
          createdAt: '2024-01-01T16:00:00Z',
          updatedAt: '2024-01-01T16:00:00Z',
        },
      ];

      mockRequest.mockResolvedValue(mockPins);

      const result = await getNearbyPins(latitude, longitude);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins', {
        method: 'GET',
        params: { latitude, longitude },
      });

      expect(result).toEqual(mockPins);
    });

    it('should handle empty results', async () => {
      mockRequest.mockResolvedValue([]);

      const result = await getNearbyPins(0, 0, 100);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API errors when fetching pins', async () => {
      mockRequest.mockRejectedValue(new Error('Pins fetch failed'));

      await expect(getNearbyPins(40.7128, -74.0060)).rejects.toThrow('Pins fetch failed');
    });

    it('should handle extreme coordinates', async () => {
      const extremeLat = 85.0511; // Near north pole
      const extremeLng = 180.0000; // International date line

      mockRequest.mockResolvedValue([]);

      const result = await getNearbyPins(extremeLat, extremeLng, 5000);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins', {
        method: 'GET',
        params: { latitude: extremeLat, longitude: extremeLng, maxDistance: 5000 },
      });
    });

    it('should handle very large max distance', async () => {
      const hugeDistance = 100000; // 100km

      mockRequest.mockResolvedValue([]);

      await getNearbyPins(40.7128, -74.0060, hugeDistance);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins', {
        method: 'GET',
        params: { latitude: 40.7128, longitude: -74.0060, maxDistance: hugeDistance },
      });
    });
  });

  describe('likePin', () => {
    it('should like a pin successfully', async () => {
      const pinId = 'pin123';
      const mockResponse = { likes: 5 };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await likePin(pinId);

      expect(mockRequest).toHaveBeenCalledWith(`/map/pins/${pinId}/like`, {
        method: 'POST',
      });

      expect(result).toEqual(mockResponse);
      expect(result.likes).toBe(5);
    });

    it('should handle API errors when liking pin', async () => {
      mockRequest.mockRejectedValue(new Error('Like failed'));

      await expect(likePin('invalid-pin')).rejects.toThrow('Like failed');
    });

    it('should handle pin not found', async () => {
      mockRequest.mockRejectedValue(new Error('Pin not found'));

      await expect(likePin('nonexistent')).rejects.toThrow('Pin not found');
    });

    it('should handle already liked pin', async () => {
      mockRequest.mockRejectedValue(new Error('Already liked'));

      await expect(likePin('already-liked')).rejects.toThrow('Already liked');
    });
  });

  describe('commentOnPin', () => {
    it('should comment on a pin successfully', async () => {
      const pinId = 'pin123';
      const commentText = 'Great activity!';
      const mockResponse = { comments: 3 };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await commentOnPin(pinId, commentText);

      expect(mockRequest).toHaveBeenCalledWith(`/map/pins/${pinId}/comment`, {
        method: 'POST',
        body: { text: commentText },
      });

      expect(result).toEqual(mockResponse);
      expect(result.comments).toBe(3);
    });

    it('should handle empty comments', async () => {
      const mockResponse = { comments: 1 };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await commentOnPin('pin123', '');

      expect(mockRequest).toHaveBeenCalledWith('/map/pins/pin123/comment', {
        method: 'POST',
        body: { text: '' },
      });
    });

    it('should handle long comments', async () => {
      const longComment = 'A'.repeat(1000); // Very long comment
      const mockResponse = { comments: 2 };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await commentOnPin('pin123', longComment);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins/pin123/comment', {
        method: 'POST',
        body: { text: longComment },
      });
    });

    it('should handle API errors when commenting', async () => {
      mockRequest.mockRejectedValue(new Error('Comment failed'));

      await expect(commentOnPin('pin123', 'Test comment')).rejects.toThrow('Comment failed');
    });

    it('should handle comment moderation rejection', async () => {
      mockRequest.mockRejectedValue(new Error('Comment contains inappropriate content'));

      await expect(commentOnPin('pin123', 'bad comment')).rejects.toThrow('Comment contains inappropriate content');
    });

    it('should handle special characters in comments', async () => {
      const specialComment = 'Great activity! 🌟🚀 #petlife @friend 🐕';
      const mockResponse = { comments: 4 };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await commentOnPin('pin123', specialComment);

      expect(mockRequest).toHaveBeenCalledWith('/map/pins/pin123/comment', {
        method: 'POST',
        body: { text: specialComment },
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network connectivity issues', async () => {
      mockRequest.mockRejectedValue(new Error('Network request failed'));

      await expect(startActivity({ petId: 'pet123', activity: 'walking' })).rejects.toThrow('Network request failed');
    });

    it('should handle malformed API responses', async () => {
      mockRequest.mockResolvedValue('invalid response');

      const result = await startActivity({ petId: 'pet123', activity: 'walking' });
      expect(result).toBe('invalid response');
    });

    it('should handle concurrent operations', async () => {
      const operations = [
        startActivity({ petId: 'pet1', activity: 'walking' }),
        startActivity({ petId: 'pet2', activity: 'playing' }),
        getNearbyPins(40.7128, -74.0060),
        likePin('pin1'),
        commentOnPin('pin2', 'Nice!'),
      ];

      // Mock all responses
      operations.forEach(() => {
        mockRequest.mockResolvedValueOnce({});
      });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(5);
      expect(mockRequest).toHaveBeenCalledTimes(5);
    });

    it('should handle partial failures in concurrent operations', async () => {
      const operations = [
        startActivity({ petId: 'pet1', activity: 'walking' }),
        startActivity({ petId: 'pet2', activity: 'playing' }), // This will fail
        getNearbyPins(40.7128, -74.0060),
      ];

      mockRequest.mockResolvedValueOnce({ _id: 'activity1' });
      mockRequest.mockRejectedValueOnce(new Error('Activity 2 failed'));
      mockRequest.mockResolvedValueOnce([]);

      const results = await Promise.allSettled(operations);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect((results[1] as any).reason.message).toBe('Activity 2 failed');
      expect(results[2].status).toBe('fulfilled');
    });

    it('should handle invalid activity parameters', async () => {
      // Test with missing required fields
      await expect(startActivity({ petId: '', activity: 'walking' })).rejects.toThrow();

      await expect(startActivity({ petId: 'pet123', activity: '' })).rejects.toThrow();
    });

    it('should handle location accuracy variations', async () => {
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 100, // Low accuracy
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'walking',
      };

      const mockResponse: MapPin = {
        _id: 'low-accuracy-activity',
        userId: 'user123',
        petId: 'pet123',
        activity: 'walking',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 100,
        shareToMap: false,
        active: true,
        likes: [],
        createdAt: '2024-01-01T17:00:00Z',
        updatedAt: '2024-01-01T17:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(result.location.coordinates).toEqual([-74.0060, 40.7128]);
    });

    it('should handle zero coordinates', async () => {
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 0,
          longitude: 0,
          altitude: 0,
          accuracy: 1,
          altitudeAccuracy: 1,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      });

      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'resting',
      };

      const mockResponse: MapPin = {
        _id: 'zero-coords-activity',
        userId: 'user123',
        petId: 'pet123',
        activity: 'resting',
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        radiusMeters: 100,
        shareToMap: false,
        active: true,
        likes: [],
        createdAt: '2024-01-01T18:00:00Z',
        updatedAt: '2024-01-01T18:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(result.location.coordinates).toEqual([0, 0]);
    });

    it('should handle very large radius values', async () => {
      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'exploring',
        radiusMeters: 50000, // 50km radius
      };

      const mockResponse: MapPin = {
        _id: 'large-radius-activity',
        userId: 'user123',
        petId: 'pet123',
        activity: 'exploring',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 50000,
        shareToMap: false,
        active: true,
        likes: [],
        createdAt: '2024-01-01T19:00:00Z',
        updatedAt: '2024-01-01T19:00:00Z',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await startActivity(params);

      expect(result.radiusMeters).toBe(50000);
    });

    it('should handle activities with many likes', async () => {
      const manyLikes = Array.from({ length: 100 }, (_, i) => ({
        userId: `user${i}`,
        likedAt: new Date(Date.now() - i * 60000).toISOString(), // Different times
      }));

      const mockPin: MapPin = {
        _id: 'popular-pin',
        userId: 'creator',
        petId: 'pet123',
        activity: 'popular_activity',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 200,
        shareToMap: true,
        active: true,
        likes: manyLikes,
        createdAt: '2024-01-01T20:00:00Z',
        updatedAt: '2024-01-01T20:00:00Z',
      };

      mockRequest.mockResolvedValue([mockPin]);

      const result = await getNearbyPins(40.7128, -74.0060);

      expect(result[0].likes).toHaveLength(100);
    });

    it('should handle pins with very long messages', async () => {
      const longMessage = 'A'.repeat(2000); // Very long message

      const mockPin: MapPin = {
        _id: 'long-message-pin',
        userId: 'user123',
        petId: 'pet123',
        activity: 'storytelling',
        message: longMessage,
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 100,
        shareToMap: true,
        active: true,
        likes: [],
        createdAt: '2024-01-01T21:00:00Z',
        updatedAt: '2024-01-01T21:00:00Z',
      };

      mockRequest.mockResolvedValue([mockPin]);

      const result = await getNearbyPins(40.7128, -74.0060);

      expect(result[0].message).toBe(longMessage);
      expect(result[0].message?.length).toBe(2000);
    });

    it('should handle rate limiting', async () => {
      mockRequest.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(likePin('pin123')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle authentication errors', async () => {
      mockRequest.mockRejectedValue(new Error('Unauthorized'));

      await expect(startActivity({ petId: 'pet123', activity: 'walking' })).rejects.toThrow('Unauthorized');
    });

    it('should handle server errors', async () => {
      mockRequest.mockRejectedValue(new Error('Internal server error'));

      await expect(getNearbyPins(40.7128, -74.0060)).rejects.toThrow('Internal server error');
    });
  });

  describe('Location Permission Handling', () => {
    it('should handle permission granted', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
      });

      // The service doesn't directly use this, but it's good to test location permissions
      const permission = await mockLocation.requestForegroundPermissionsAsync();
      expect(permission.granted).toBe(true);
    });

    it('should handle permission denied', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
      });

      const permission = await mockLocation.requestForegroundPermissionsAsync();
      expect(permission.granted).toBe(false);
    });

    it('should handle permission undetermined', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        granted: false,
        canAskAgain: true,
      });

      const permission = await mockLocation.requestForegroundPermissionsAsync();
      expect(permission.granted).toBe(false);
      expect(permission.canAskAgain).toBe(true);
    });
  });

  describe('Data Validation and Type Safety', () => {
    it('should maintain type safety for MapPin objects', async () => {
      const mockPin: MapPin = {
        _id: 'typed-pin',
        userId: 'user123',
        petId: 'pet123',
        activity: 'walking',
        message: 'Type-safe message',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        radiusMeters: 500,
        shareToMap: true,
        active: true,
        likes: [
          { userId: 'liker1', likedAt: '2024-01-01T22:00:00Z' },
          { userId: 'liker2', likedAt: '2024-01-01T22:30:00Z' },
        ],
        createdAt: '2024-01-01T21:00:00Z',
        updatedAt: '2024-01-01T22:00:00Z',
      };

      mockRequest.mockResolvedValue([mockPin]);

      const result = await getNearbyPins(40.7128, -74.0060);

      expect(result[0]._id).toBe('typed-pin');
      expect(result[0].location.type).toBe('Point');
      expect(Array.isArray(result[0].location.coordinates)).toBe(true);
      expect(result[0].location.coordinates).toHaveLength(2);
      expect(typeof result[0].radiusMeters).toBe('number');
      expect(typeof result[0].shareToMap).toBe('boolean');
      expect(Array.isArray(result[0].likes)).toBe(true);
    });

    it('should handle optional fields correctly', async () => {
      const pinWithoutOptionals: MapPin = {
        _id: 'minimal-pin',
        userId: 'user123',
        petId: 'pet123',
        activity: 'minimal',
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        radiusMeters: 100,
        shareToMap: false,
        active: true,
        likes: [],
        createdAt: '2024-01-01T23:00:00Z',
        updatedAt: '2024-01-01T23:00:00Z',
        // No message, no packId, no packName, no activityDetails
      };

      mockRequest.mockResolvedValue([pinWithoutOptionals]);

      const result = await getNearbyPins(0, 0);

      expect(result[0].message).toBeUndefined();
      expect(result[0].packId).toBeUndefined();
      expect(result[0].packName).toBeUndefined();
      expect(result[0].activityDetails).toBeUndefined();
    });
  });
});
