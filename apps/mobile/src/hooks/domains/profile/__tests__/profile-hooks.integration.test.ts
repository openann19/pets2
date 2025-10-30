/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Integration test showing hook composition
describe('Hooks Integration - Profile Management Flow', () => {
  // Mock all dependencies
  jest.mock('../../../stores/useAuthStore', () => ({
    useAuthStore: () => ({
      user: { _id: 'user123', firstName: 'John', lastName: 'Doe' },
      updateUser: jest.fn(),
    }),
  }));

  jest.mock('../../../services/api', () => ({
    matchesAPI: {
      getMyPets: jest.fn(),
      updateProfile: jest.fn(),
    },
  }));

  jest.mock('../../../services/logger', () => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
  }));

  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }));

  const { useProfileData } = require('../useProfileData');
  const { useProfileUpdate } = require('../useProfileUpdate');
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  const { matchesAPI } = require('../../../services/api');

  const mockAsyncStorage = AsyncStorage;
  const mockMatchesAPI = matchesAPI;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockMatchesAPI.getMyPets.mockResolvedValue({
      data: [{ _id: 'pet1', name: 'Buddy', species: 'dog' }],
    });

    mockMatchesAPI.updateProfile.mockResolvedValue({
      _id: 'user123',
      firstName: 'John',
      lastName: 'Updated',
      bio: 'Updated bio',
    });

    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should demonstrate complete profile management workflow', async () => {
    // Render multiple hooks together to simulate real usage
    const { result: profileDataResult } = renderHook(() => useProfileData());
    const { result: profileUpdateResult } = renderHook(() => useProfileUpdate());

    // 1. Initial profile data loads
    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    expect(profileDataResult.current.user.firstName).toBe('John');
    expect(profileDataResult.current.pets).toHaveLength(1);
    expect(profileDataResult.current.pets[0].name).toBe('Buddy');

    // 2. User updates profile
    const updateData = {
      firstName: 'Johnny',
      bio: 'Love pets!',
    };

    const updateSuccess = await act(async () => {
      return await profileUpdateResult.current.updateProfile(updateData);
    });

    expect(updateSuccess).toBe(true);
    expect(mockMatchesAPI.updateProfile).toHaveBeenCalledWith(updateData);

    // 3. Profile data refreshes to show updates
    act(() => {
      profileDataResult.current.refreshProfile();
    });

    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    // Verify the update was processed
    expect(mockMatchesAPI.getMyPets).toHaveBeenCalledTimes(2); // Initial + refresh
  });

  it('should handle error states across hooks', async () => {
    // Setup error scenario
    mockMatchesAPI.getMyPets.mockRejectedValueOnce(new Error('Network error'));

    const { result: profileDataResult } = renderHook(() => useProfileData());

    // Profile data fails to load
    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    expect(profileDataResult.current.error).toBe('Network error');
    expect(profileDataResult.current.pets).toEqual([]);

    // Recovery: fix the API and refresh
    mockMatchesAPI.getMyPets.mockResolvedValueOnce({
      data: [{ _id: 'pet1', name: 'Buddy', species: 'dog' }],
    });

    act(() => {
      profileDataResult.current.refreshProfile();
    });

    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    expect(profileDataResult.current.error).toBe(null);
    expect(profileDataResult.current.pets).toHaveLength(1);
  });

  it('should demonstrate hook composition benefits', () => {
    // This test shows how hooks compose together
    const { result: profileDataResult } = renderHook(() => useProfileData());
    const { result: profileUpdateResult } = renderHook(() => useProfileUpdate());

    // Each hook maintains its own state
    expect(typeof profileDataResult.current.refreshProfile).toBe('function');
    expect(typeof profileUpdateResult.current.updateProfile).toBe('function');

    // Hooks can be used independently or together
    expect(profileDataResult.current.user).toBeDefined();
    expect(profileUpdateResult.current.isUpdating).toBe(false);

    // State is properly isolated between hooks
    expect(profileDataResult.current).not.toBe(profileUpdateResult.current);
  });

  it('should handle concurrent operations', async () => {
    const { result: profileDataResult } = renderHook(() => useProfileData());
    const { result: profileUpdateResult } = renderHook(() => useProfileUpdate());

    // Wait for initial data load
    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    // Start both operations concurrently
    const updatePromise = act(async () => {
      return await profileUpdateResult.current.updateProfile({
        bio: 'New bio',
      });
    });

    act(() => {
      profileDataResult.current.refreshProfile();
    });

    // Both operations should complete successfully
    const updateResult = await updatePromise;

    await waitFor(() => {
      expect(profileDataResult.current.isLoading).toBe(false);
    });

    expect(updateResult).toBe(true);
    expect(mockMatchesAPI.updateProfile).toHaveBeenCalledTimes(1);
    expect(mockMatchesAPI.getMyPets).toHaveBeenCalledTimes(2);
  });
});
