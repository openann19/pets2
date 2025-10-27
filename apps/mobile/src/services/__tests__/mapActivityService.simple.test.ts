/**
 * Simplified MapActivityService Tests - Core functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  startActivity,
  getNearbyPins,
  likePin,
  type CreateActivityParams,
  type MapPin,
} from '../mapActivityService';

// Mock dependencies
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: null,
      accuracy: 5,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}));

jest.mock('../api', () => ({
  request: jest.fn(),
}));

import { request } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('MapActivityService - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startActivity', () => {
    const activityParams: CreateActivityParams = {
      petId: 'pet123',
      activity: 'walking',
      message: 'Going for a walk!',
      shareToMap: true,
      radiusMeters: 1000,
    };

    it('should start activity successfully', async () => {
      const mockResponse: MapPin = {
        _id: 'activity123',
        userId: 'user123',
        petId: 'pet123',
        activity: 'walking',
        message: 'Going for a walk!',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128], // [lng, lat]
        },
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        radiusMeters: 1000,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await startActivity(activityParams);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/map/activity/start', {
        method: 'POST',
        body: expect.objectContaining({
          petId: 'pet123',
          activity: 'walking',
          message: 'Going for a walk!',
          shareToMap: true,
          radiusMeters: 1000,
          location: expect.any(Object),
        }),
      });
    });

    it('should handle activity start errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Location permission denied'));

      await expect(startActivity(activityParams)).rejects.toThrow('Location permission denied');
    });
  });

  describe('getNearbyPins', () => {
    it('should get nearby pins successfully', async () => {
      const mockPins: MapPin[] = [
        {
          _id: 'pin1',
          userId: 'user1',
          petId: 'pet1',
          activity: 'walking',
          location: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128],
          },
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
        },
        {
          _id: 'pin2',
          userId: 'user2',
          petId: 'pet2',
          activity: 'playing',
          location: {
            type: 'Point',
            coordinates: [-74.0061, 40.7129],
          },
          createdAt: new Date().toISOString(),
          likes: ['user1'],
          comments: [],
        },
      ];

      mockRequest.mockResolvedValueOnce(mockPins);

      const result = await getNearbyPins(40.7128, -74.0060);

      expect(result).toEqual(mockPins);
      expect(mockRequest).toHaveBeenCalledWith('/map/pins', {
        method: 'GET',
        params: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    });

    it('should handle empty results', async () => {
      mockRequest.mockResolvedValueOnce([]);

      const result = await getNearbyPins(40.7128, -74.0060);

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'));

      await expect(getNearbyPins(40.7128, -74.0060)).rejects.toThrow('Network error');
    });
  });

  describe('likePin', () => {
    it('should like pin successfully', async () => {
      const mockResponse = { likes: 5 };
      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await likePin('pin123');

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/map/pins/pin123/like', {
        method: 'POST',
      });
    });

    it('should handle like errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Already liked'));

      await expect(likePin('pin123')).rejects.toThrow('Already liked');
    });
  });

  describe('Activity Parameters', () => {
    it('should handle activity without message', async () => {
      const params: CreateActivityParams = {
        petId: 'pet123',
        activity: 'running',
        shareToMap: false,
      };

      const mockResponse: MapPin = {
        _id: 'activity456',
        userId: 'user123',
        petId: 'pet123',
        activity: 'running',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
        },
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await startActivity(params);

      expect(result.activity).toBe('running');
      expect(result.message).toBeUndefined();
    });

    it('should handle different activity types', async () => {
      const activities = ['walking', 'running', 'playing', 'eating', 'sleeping'];

      for (const activity of activities) {
        const params: CreateActivityParams = {
          petId: 'pet123',
          activity: activity as any,
          shareToMap: true,
        };

        const mockResponse: MapPin = {
          _id: `activity_${activity}`,
          userId: 'user123',
          petId: 'pet123',
          activity,
          location: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128],
          },
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
        };

        mockRequest.mockResolvedValueOnce(mockResponse);

        const result = await startActivity(params);
        expect(result.activity).toBe(activity);

        jest.clearAllMocks();
      }
    });
  });
});
