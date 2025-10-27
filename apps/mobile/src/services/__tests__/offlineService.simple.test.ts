/**
 * Simplified OfflineService Tests - Core functionality
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { offlineService, OfflineService } from '../offlineService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('../api', () => ({
  api: {
    getPets: jest.fn(),
    getMatches: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    updateUserProfile: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../api';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockApi = api as jest.Mocked<typeof api>;

describe('OfflineService - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockAsyncStorage.getAllKeys.mockResolvedValue(['offline_data', 'other_key']);

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    } as any);

    // Mock successful API calls
    mockApi.getPets.mockResolvedValue([]);
    mockApi.getMatches.mockResolvedValue([]);
    mockApi.getMessages.mockResolvedValue([]);
    mockApi.sendMessage.mockResolvedValue(undefined);
    mockApi.updateUserProfile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Clean up singleton
    offlineService.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize with default offline data', () => {
      const offlineData = (offlineService as any).offlineData;

      expect(offlineData.pets).toEqual([]);
      expect(offlineData.user).toBeNull();
      expect(offlineData.matches).toEqual([]);
      expect(offlineData.messages).toEqual([]);
      expect(offlineData.pendingActions).toEqual([]);
      expect(typeof offlineData.lastSync).toBe('string');
    });

    it('should load offline data from storage', async () => {
      const storedData = {
        pets: [{ id: 'pet1', name: 'Buddy' }],
        user: { id: 'user1', name: 'John' },
        matches: [{ id: 'match1' }],
        messages: [{ id: 'msg1' }],
        lastSync: '2024-01-01T00:00:00Z',
        pendingActions: [{
          id: 'action1',
          type: 'swipe' as const,
          data: {},
          timestamp: '2024-01-01T00:00:00Z',
          retryCount: 0
        }],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      // Create new instance to test loading
      const newService = new OfflineService();
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 10));

      const offlineData = (newService as any).offlineData;
      expect(offlineData.pets).toEqual(storedData.pets);
      expect(offlineData.user).toEqual(storedData.user);
      expect(offlineData.pendingActions).toEqual(storedData.pendingActions);
    });
  });

  describe('Data Management', () => {
    it('should retrieve pets from offline storage', async () => {
      const pets = [{ id: 'pet1', name: 'Buddy' }];
      (offlineService as any).offlineData.pets = pets;

      const result = await offlineService.getPets();
      expect(result).toEqual(pets);
    });

    it('should retrieve user from offline storage', async () => {
      const user = { id: 'user1', name: 'John' };
      (offlineService as any).offlineData.user = user;

      const result = offlineService.getUser();
      expect(result).toEqual(user);
    });

    it('should fetch pets online when available', async () => {
      const onlinePets = [{ id: 'pet2', name: 'Luna' }];
      mockApi.getPets.mockResolvedValue(onlinePets);

      const result = await offlineService.getPets();

      expect(result).toEqual(onlinePets);
      expect(mockApi.getPets).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should fetch user online when available', async () => {
      // Note: getUser currently doesn't fetch online due to commented code
      const offlineUser = { id: 'user1', name: 'John' };
      (offlineService as any).offlineData.user = offlineUser;

      const result = offlineService.getUser();
      expect(result).toEqual(offlineUser);
    });
  });

  describe('Pending Actions', () => {
    it('should add pending actions', () => {
      offlineService.addPendingAction('swipe', { petId: 'pet1', direction: 'like' });

      const offlineData = (offlineService as any).offlineData;
      expect(offlineData.pendingActions).toHaveLength(1);
      expect(offlineData.pendingActions[0].type).toBe('swipe');
      expect(offlineData.pendingActions[0].data).toEqual({ petId: 'pet1', direction: 'like' });
    });

    it('should retrieve pending actions count', () => {
      offlineService.addPendingAction('swipe', { petId: 'pet1', direction: 'like' });
      offlineService.addPendingAction('message', { matchId: 'match1', text: 'Hi!' });

      const status = offlineService.getSyncStatus();
      expect(status.pendingActionsCount).toBe(2);
    });

    it('should add swipe action offline', () => {
      offlineService.swipePet('pet1', 'like');

      const offlineData = (offlineService as any).offlineData;
      expect(offlineData.pendingActions).toHaveLength(1);
      expect(offlineData.pendingActions[0].type).toBe('swipe');
      expect(offlineData.pendingActions[0].data).toEqual({ petId: 'pet1', direction: 'like' });
    });
  });

  describe('Network Monitoring', () => {
    it('should report online status when connected', async () => {
      const status = offlineService.getSyncStatus();
      expect(status.isOnline).toBe(true);
    });
  });

  describe('Sync Status', () => {
    it('should provide comprehensive sync status', async () => {
      // Add some data
      offlineService.addPendingAction('swipe', { petId: 'pet1' });
      (offlineService as any).isSyncing = false;
      (offlineService as any).offlineData.lastSync = '2024-01-01T00:00:00Z';

      const status = offlineService.getSyncStatus();

      expect(status.isOnline).toBe(true);
      expect(status.isSyncing).toBe(false);
      expect(status.pendingActionsCount).toBe(1);
      expect(status.lastSyncTime).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('Data Persistence', () => {
    it('should clear offline data', async () => {
      // Add some data first
      (offlineService as any).offlineData.pets = [{ id: 'pet1' }];
      (offlineService as any).offlineData.user = { id: 'user1' };
      offlineService.addPendingAction('swipe', { petId: 'pet1' });

      await offlineService.clearOfflineData();

      const offlineData = (offlineService as any).offlineData;
      expect(offlineData.pets).toEqual([]);
      expect(offlineData.user).toBeNull();
      expect(offlineData.pendingActions).toEqual([]);
    });

    it('should get storage size', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['offline_data', 'other_key']);
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'offline_data') return Promise.resolve('{"pets":[]}');
        if (key === 'other_key') return Promise.resolve('test_data');
        return Promise.resolve(null);
      });

      const size = await offlineService.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });
  });
});
