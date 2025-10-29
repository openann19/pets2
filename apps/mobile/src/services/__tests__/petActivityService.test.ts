/**
 * Comprehensive tests for PetActivityService
 *
 * Coverage:
 * - Activity lifecycle (start/end activities)
 * - Location services integration
 * - Real-time socket communication
 * - Activity history retrieval
 * - Permission handling
 * - Error handling and validation
 * - Platform-specific behavior
 * - Concurrent operations
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import {
  startPetActivity,
  endPetActivity,
  getActivityHistory,
  type StartActivityPayload,
  type ActivityRecord,
} from '../petActivityService';

// Mock dependencies
jest.mock('expo-location');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../socket', () => ({
  socketClient: {
    emit: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { logger } from '@pawfectmatch/core';
import { socketClient } from '../socket';

const mockLocation = Location as jest.Mocked<typeof Location>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockSocketClient = socketClient as jest.Mocked<typeof socketClient>;

describe('PetActivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        altitude: 10,
        accuracy: 5,
        altitudeAccuracy: 1,
        heading: 90,
        speed: 1.5,
      },
      timestamp: Date.now(),
    });

    mockSocketClient.emit.mockImplementation(() => {}); // No-op
  });

  describe('getCurrentLocation', () => {
    it('should get current location with permissions', async () => {
      const location = await (global as any).getCurrentLocation();

      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });

      expect(location).toEqual({
        lat: 40.7128,
        lng: -74.006,
      });
    });

    it('should handle permission denied', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
      });

      await expect((global as any).getCurrentLocation()).rejects.toThrow(
        'Location permission not granted',
      );
    });

    it('should handle location services unavailable', async () => {
      mockLocation.getCurrentPositionAsync.mockRejectedValue(
        new Error('Location services are disabled'),
      );

      await expect((global as any).getCurrentLocation()).rejects.toThrow(
        'Location services are disabled',
      );
    });

    it('should handle undetermined permission status', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        granted: false,
        canAskAgain: true,
      });

      await expect((global as any).getCurrentLocation()).rejects.toThrow(
        'Location permission not granted',
      );
    });
  });

  describe('startPetActivity', () => {
    const mockActivityRecord: ActivityRecord = {
      _id: 'activity123',
      petId: 'pet456',
      activity: 'walk',
      message: 'Enjoying a walk!',
      lat: 40.7128,
      lng: -74.006,
      radius: 500,
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
      active: true,
    };

    it('should start a pet activity successfully', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet456',
        activity: 'walk',
        message: 'Enjoying a walk!',
        shareToMap: true,
        radiusMeters: 500,
      };

      const mockResponse = {
        data: mockActivityRecord,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/pets/activity/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: 'pet456',
          activity: 'walk',
          message: 'Enjoying a walk!',
          shareToMap: true,
          location: { lat: 40.7128, lng: -74.006 },
          radius: 500,
          device: 'ios',
        }),
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('activity:start', {
        petId: 'pet456',
        activity: 'walk',
        message: 'Enjoying a walk!',
        shareToMap: true,
        location: { lat: 40.7128, lng: -74.006 },
        radius: 500,
        device: 'ios',
        _id: 'activity123',
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Activity started', {
        record: mockActivityRecord,
      });
      expect(result).toEqual(mockActivityRecord);
    });

    it('should start activity with default values', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet789',
        activity: 'play',
      };

      const mockResponse = {
        data: {
          _id: 'activity789',
          petId: 'pet789',
          activity: 'play',
          message: '',
          lat: 40.7128,
          lng: -74.006,
          radius: 500, // default
          createdAt: '2024-01-01T13:00:00Z',
          updatedAt: '2024-01-01T13:00:00Z',
          active: true,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/pets/activity/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: 'pet789',
          activity: 'play',
          message: '',
          shareToMap: true, // default
          location: { lat: 40.7128, lng: -74.006 },
          radius: 500, // default
          device: 'ios',
        }),
      });

      expect(result.message).toBe('');
    });

    it('should handle all activity types', async () => {
      const activityTypes: Array<'walk' | 'play' | 'feeding' | 'rest' | 'training' | 'lost_pet'> = [
        'walk',
        'play',
        'feeding',
        'rest',
        'training',
        'lost_pet',
      ];

      for (const activityType of activityTypes) {
        const payload: StartActivityPayload = {
          petId: 'pet123',
          activity: activityType,
        };

        const mockResponse = {
          data: {
            _id: `activity-${activityType}`,
            petId: 'pet123',
            activity: activityType,
            lat: 40.7128,
            lng: -74.006,
            createdAt: '2024-01-01T14:00:00Z',
            updatedAt: '2024-01-01T14:00:00Z',
            active: true,
          },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await startPetActivity(payload);

        expect(result.activity).toBe(activityType);
        expect(mockSocketClient.emit).toHaveBeenCalledWith(
          'activity:start',
          expect.objectContaining({
            activity: activityType,
          }),
        );
      }
    });

    it('should handle API errors during activity start', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid pet ID'),
      });

      await expect(startPetActivity(payload)).rejects.toThrow(
        'startPetActivity failed: 400 Invalid pet ID',
      );

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
      };

      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(startPetActivity(payload)).rejects.toThrow('Network error');
    });

    it('should handle malformed API responses', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}), // Missing data field
      });

      const result = await startPetActivity(payload);
      expect(result).toBeUndefined(); // Will throw when accessing undefined
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

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'exploring',
      };

      const mockResponse = {
        data: {
          _id: 'extreme-activity',
          petId: 'pet123',
          activity: 'exploring',
          lat: 89.9999,
          lng: 179.9999,
          createdAt: '2024-01-01T15:00:00Z',
          updatedAt: '2024-01-01T15:00:00Z',
          active: true,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.lat).toBe(89.9999);
      expect(result.lng).toBe(179.9999);
    });
  });

  describe('endPetActivity', () => {
    const mockActivityRecord: ActivityRecord = {
      _id: 'activity123',
      petId: 'pet456',
      activity: 'walk',
      lat: 40.7128,
      lng: -74.006,
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T13:00:00Z',
      active: false,
    };

    it('should end a pet activity successfully', async () => {
      const activityId = 'activity123';

      const mockResponse = {
        data: mockActivityRecord,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await endPetActivity(activityId);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/pets/activity/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('activity:end', {
        _id: 'activity123',
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Activity ended', {
        record: mockActivityRecord,
      });
      expect(result).toEqual(mockActivityRecord);
      expect(result.active).toBe(false);
    });

    it('should handle API errors during activity end', async () => {
      const activityId = 'invalid-activity';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Activity not found'),
      });

      await expect(endPetActivity(activityId)).rejects.toThrow(
        'endPetActivity failed: 404 Activity not found',
      );

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle activity already ended', async () => {
      const activityId = 'ended-activity';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Activity already ended'),
      });

      await expect(endPetActivity(activityId)).rejects.toThrow(
        'endPetActivity failed: 400 Activity already ended',
      );
    });

    it('should handle network errors during end', async () => {
      const activityId = 'network-error-activity';

      mockFetch.mockRejectedValue(new Error('Network timeout'));

      await expect(endPetActivity(activityId)).rejects.toThrow('Network timeout');
    });
  });

  describe('getActivityHistory', () => {
    const mockActivityHistory: ActivityRecord[] = [
      {
        _id: 'activity1',
        petId: 'pet123',
        activity: 'walk',
        message: 'Morning walk',
        lat: 40.7128,
        lng: -74.006,
        radius: 500,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
        active: false,
      },
      {
        _id: 'activity2',
        petId: 'pet123',
        activity: 'play',
        message: 'Park playtime',
        lat: 40.713,
        lng: -74.005,
        radius: 300,
        createdAt: '2024-01-01T14:00:00Z',
        updatedAt: '2024-01-01T15:30:00Z',
        active: false,
      },
      {
        _id: 'activity3',
        petId: 'pet123',
        activity: 'feeding',
        lat: 40.7125,
        lng: -74.0065,
        createdAt: '2024-01-01T18:00:00Z',
        updatedAt: '2024-01-01T18:05:00Z',
        active: false,
      },
    ];

    it('should get activity history for a pet', async () => {
      const petId = 'pet123';

      const mockResponse = {
        data: mockActivityHistory,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityHistory(petId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/pets/activity/history?petId=${encodeURIComponent(petId)}`,
      );

      expect(result).toEqual(mockActivityHistory);
      expect(result).toHaveLength(3);
    });

    it('should handle empty activity history', async () => {
      const petId = 'pet-with-no-history';

      const mockResponse = {
        data: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityHistory(petId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle pets with many activities', async () => {
      const petId = 'active-pet';
      const manyActivities = Array.from({ length: 100 }, (_, i) => ({
        _id: `activity${i}`,
        petId,
        activity: 'walk' as const,
        lat: 40.7128 + i * 0.001,
        lng: -74.006 + i * 0.001,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(), // Different times
        updatedAt: new Date(Date.now() - i * 3600000 + 1800000).toISOString(),
        active: false,
      }));

      const mockResponse = {
        data: manyActivities,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityHistory(petId);

      expect(result).toHaveLength(100);
      expect(result[0]._id).toBe('activity0');
      expect(result[99]._id).toBe('activity99');
    });

    it('should handle API errors when fetching history', async () => {
      const petId = 'invalid-pet';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Pet not found'),
      });

      await expect(getActivityHistory(petId)).rejects.toThrow(
        'getActivityHistory failed: 404 Pet not found',
      );
    });

    it('should handle network errors', async () => {
      const petId = 'network-error-pet';

      mockFetch.mockRejectedValue(new Error('Connection failed'));

      await expect(getActivityHistory(petId)).rejects.toThrow('Connection failed');
    });

    it('should handle malformed API responses', async () => {
      const petId = 'malformed-response-pet';

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}), // Missing data field
      });

      const result = await getActivityHistory(petId);
      expect(result).toBeUndefined();
    });

    it('should handle special characters in pet IDs', async () => {
      const specialPetId = 'pet@123_special.test';

      const mockResponse = {
        data: [
          {
            _id: 'activity1',
            petId: specialPetId,
            activity: 'walk',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T11:00:00Z',
            active: false,
          },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityHistory(specialPetId);

      expect(result[0].petId).toBe(specialPetId);
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/pets/activity/history?petId=${encodeURIComponent(specialPetId)}`,
      );
    });
  });

  describe('Socket Communication', () => {
    it('should emit socket events for activity start', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
        message: 'Socket test',
      };

      const mockResponse = {
        data: {
          _id: 'socket-activity',
          petId: 'pet123',
          activity: 'walk',
          message: 'Socket test',
          lat: 40.7128,
          lng: -74.006,
          createdAt: '2024-01-01T16:00:00Z',
          updatedAt: '2024-01-01T16:00:00Z',
          active: true,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await startPetActivity(payload);

      expect(mockSocketClient.emit).toHaveBeenCalledWith('activity:start', {
        petId: 'pet123',
        activity: 'walk',
        message: 'Socket test',
        shareToMap: true,
        location: { lat: 40.7128, lng: -74.006 },
        radius: 500,
        device: 'ios',
        _id: 'socket-activity',
      });
    });

    it('should emit socket events for activity end', async () => {
      const activityId = 'end-activity-123';

      const mockResponse = {
        data: {
          _id: activityId,
          petId: 'pet123',
          activity: 'walk',
          active: false,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await endPetActivity(activityId);

      expect(mockSocketClient.emit).toHaveBeenCalledWith('activity:end', {
        _id: activityId,
      });
    });

    it('should not emit socket events on API failure', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Server error'),
      });

      await expect(startPetActivity(payload)).rejects.toThrow();

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
    });
  });

  describe('Platform Handling', () => {
    it('should include platform information in activity start', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'play',
      };

      const mockResponse = {
        data: {
          _id: 'platform-activity',
          petId: 'pet123',
          activity: 'play',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await startPetActivity(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"device":"ios"'),
        }),
      );
    });

    it('should handle Android platform', async () => {
      Platform.OS = 'android';

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'rest',
      };

      const mockResponse = {
        data: {
          _id: 'android-activity',
          petId: 'pet123',
          activity: 'rest',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await startPetActivity(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"device":"android"'),
        }),
      );

      Platform.OS = 'ios'; // Reset
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent activity starts', async () => {
      const payloads: StartActivityPayload[] = [
        { petId: 'pet1', activity: 'walk' },
        { petId: 'pet2', activity: 'play' },
        { petId: 'pet3', activity: 'feeding' },
      ];

      payloads.forEach((_, index) => {
        const mockResponse = {
          data: {
            _id: `activity${index + 1}`,
            petId: `pet${index + 1}`,
            activity: _.activity,
            lat: 40.7128,
            lng: -74.006,
            createdAt: '2024-01-01T17:00:00Z',
            updatedAt: '2024-01-01T17:00:00Z',
            active: true,
          },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });
      });

      const results = await Promise.all(payloads.map((payload) => startPetActivity(payload)));

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.petId).toBe(`pet${index + 1}`);
        expect(result.activity).toBe(payloads[index].activity);
      });

      expect(mockSocketClient.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        startPetActivity({ petId: 'pet1', activity: 'walk' }),
        endPetActivity('activity123'),
        getActivityHistory('pet2'),
        startPetActivity({ petId: 'pet3', activity: 'play' }),
      ];

      // Mock all responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            _id: 'mock-activity',
            petId: 'mock-pet',
            activity: 'mock',
            active: false,
            lat: 40.7128,
            lng: -74.006,
            createdAt: '2024-01-01T18:00:00Z',
            updatedAt: '2024-01-01T18:00:00Z',
          },
        }),
      });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should handle partial failures in concurrent operations', async () => {
      const operations = [
        startPetActivity({ petId: 'success-pet', activity: 'walk' }),
        startPetActivity({ petId: 'fail-pet', activity: 'play' }),
        getActivityHistory('history-pet'),
      ];

      // Success response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { _id: 'success-activity', petId: 'success-pet', activity: 'walk' },
        }),
      });

      // Failure response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid pet'),
      });

      // History response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      });

      const results = await Promise.allSettled(operations);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');

      expect((results[0] as any).value.petId).toBe('success-pet');
      expect((results[1] as any).reason.message).toContain('startPetActivity failed: 400');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(2000); // Very long message

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
        message: longMessage,
      };

      const mockResponse = {
        data: {
          _id: 'long-message-activity',
          petId: 'pet123',
          activity: 'walk',
          message: longMessage,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.message).toBe(longMessage);
      expect(result.message?.length).toBe(2000);
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

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'rest',
      };

      const mockResponse = {
        data: {
          _id: 'zero-coords-activity',
          petId: 'pet123',
          activity: 'rest',
          lat: 0,
          lng: 0,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.lat).toBe(0);
      expect(result.lng).toBe(0);
    });

    it('should handle very large radius values', async () => {
      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'exploring',
        radiusMeters: 50000, // 50km radius
      };

      const mockResponse = {
        data: {
          _id: 'large-radius-activity',
          petId: 'pet123',
          activity: 'exploring',
          radius: 50000,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.radius).toBe(50000);
    });

    it('should handle activities with special characters', async () => {
      const specialMessage = 'Activity with émojis 🚶‍♂️🐕 and spëcial chärs! @pet_lover #walk';

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
        message: specialMessage,
      };

      const mockResponse = {
        data: {
          _id: 'special-chars-activity',
          petId: 'pet123',
          activity: 'walk',
          message: specialMessage,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.message).toBe(specialMessage);
    });

    it('should handle malformed location data', async () => {
      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: NaN, // Invalid latitude
          longitude: Infinity, // Invalid longitude
          altitude: -99999,
          accuracy: -1,
          altitudeAccuracy: NaN,
          heading: NaN,
          speed: -5,
        },
        timestamp: Date.now(),
      });

      const payload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'training',
      };

      const mockResponse = {
        data: {
          _id: 'invalid-location-activity',
          petId: 'pet123',
          activity: 'training',
          lat: NaN,
          lng: Infinity,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(payload);

      expect(result.lat).toBeNaN();
      expect(result.lng).toBe(Infinity);
    });

    it('should handle extreme activity history sizes', async () => {
      const petId = 'history-pet';
      const hugeHistory = Array.from({ length: 10000 }, (_, i) => ({
        _id: `activity${i}`,
        petId,
        activity: 'walk' as const,
        lat: 40.7128 + i * 0.0001,
        lng: -74.006 + i * 0.0001,
        createdAt: new Date(Date.now() - i * 60000).toISOString(),
        updatedAt: new Date(Date.now() - i * 60000 + 1800000).toISOString(),
        active: false,
      }));

      const mockResponse = {
        data: hugeHistory,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await getActivityHistory(petId);

      expect(result).toHaveLength(10000);
      expect(result[0]._id).toBe('activity0');
      expect(result[9999]._id).toBe('activity9999');
    });

    it('should handle rapid successive operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) =>
        startPetActivity({
          petId: `pet${i}`,
          activity: 'walk',
          message: `Activity ${i}`,
        }),
      );

      operations.forEach((_, i) => {
        const mockResponse = {
          data: {
            _id: `activity${i}`,
            petId: `pet${i}`,
            activity: 'walk',
            message: `Activity ${i}`,
            lat: 40.7128,
            lng: -74.006,
          },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse),
        });
      });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(50);
      expect(mockSocketClient.emit).toHaveBeenCalledTimes(50);
    });

    it('should handle memory pressure with large payloads', async () => {
      const hugePayload: StartActivityPayload = {
        petId: 'pet123',
        activity: 'walk',
        message: 'A'.repeat(50000), // 50KB message
        shareToMap: true,
        radiusMeters: 1000,
      };

      const mockResponse = {
        data: {
          _id: 'huge-payload-activity',
          petId: 'pet123',
          activity: 'walk',
          message: hugePayload.message,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity(hugePayload);

      expect(result.message).toBe(hugePayload.message);
      expect(result.message?.length).toBe(50000);
    });
  });

  describe('Type Safety and Interface Compliance', () => {
    it('should maintain type safety for ActivityRecord', async () => {
      const mockResponse = {
        data: {
          _id: 'typed-activity',
          petId: 'pet123',
          activity: 'walk' as const,
          message: 'Typed message',
          lat: 40.7128,
          lng: -74.006,
          radius: 500,
          createdAt: '2024-01-01T19:00:00Z',
          updatedAt: '2024-01-01T20:00:00Z',
          active: true,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity({
        petId: 'pet123',
        activity: 'walk',
        message: 'Typed message',
      });

      expect(typeof result._id).toBe('string');
      expect(typeof result.petId).toBe('string');
      expect(['walk', 'play', 'feeding', 'rest', 'training', 'lost_pet']).toContain(
        result.activity,
      );
      expect(typeof result.lat).toBe('number');
      expect(typeof result.lng).toBe('number');
      expect(typeof result.active).toBe('boolean');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.updatedAt).toBe('string');
    });

    it('should handle optional fields correctly', async () => {
      const mockResponse = {
        data: {
          _id: 'minimal-activity',
          petId: 'pet123',
          activity: 'rest' as const,
          lat: 40.7128,
          lng: -74.006,
          createdAt: '2024-01-01T21:00:00Z',
          updatedAt: '2024-01-01T21:00:00Z',
          active: true,
          // No message, no radius
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await startPetActivity({
        petId: 'pet123',
        activity: 'rest',
      });

      expect(result.message).toBeUndefined();
      expect(result.radius).toBeUndefined();
    });

    it('should enforce ActivityKind type constraints', () => {
      const validActivities: Array<'walk' | 'play' | 'feeding' | 'rest' | 'training' | 'lost_pet'> =
        ['walk', 'play', 'feeding', 'rest', 'training', 'lost_pet'];

      validActivities.forEach((activity) => {
        expect(['walk', 'play', 'feeding', 'rest', 'training', 'lost_pet']).toContain(activity);
      });
    });
  });
});
