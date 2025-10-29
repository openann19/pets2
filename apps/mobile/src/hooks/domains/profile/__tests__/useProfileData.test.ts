/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useProfileData } from '../useProfileData';

// Mock auth store
jest.mock('../../../stores/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  }),
}));

// Mock API
jest.mock('../../../services/api', () => ({
  matchesAPI: {
    getMyPets: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../../services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { matchesAPI } from '../../../services/api';
import { logger } from '../../../services/logger';

const mockMatchesAPI = matchesAPI as jest.Mocked<typeof matchesAPI>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchesAPI.getMyPets.mockResolvedValue({
      data: [
        {
          _id: 'pet1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
        },
        {
          _id: 'pet2',
          name: 'Whiskers',
          species: 'cat',
          breed: 'Persian',
        },
      ],
    });
  });

  it('should initialize with auth user data', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toEqual({
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
    expect(result.current.pets).toEqual([]);
    expect(result.current.isLoading).toBe(true); // Initially loading
    expect(result.current.error).toBe(null);
  });

  it('should load user pets on mount', async () => {
    const { result } = renderHook(() => useProfileData());

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockMatchesAPI.getMyPets).toHaveBeenCalledTimes(1);
    expect(result.current.pets).toEqual([
      {
        _id: 'pet1',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
      },
      {
        _id: 'pet2',
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
      },
    ]);
    expect(result.current.error).toBe(null);
    expect(mockLogger.info).toHaveBeenCalledWith('Profile data refreshed', {
      petCount: 2,
    });
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to load pets';
    mockMatchesAPI.getMyPets.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pets).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(mockLogger.error).toHaveBeenCalledWith('Failed to refresh profile', {
      error: errorMessage,
    });
  });

  it('should handle non-Error API rejections', async () => {
    mockMatchesAPI.getMyPets.mockRejectedValue('String error');

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pets).toEqual([]);
    expect(result.current.error).toBe('Failed to load profile');
  });

  it('should refresh profile data when called manually', async () => {
    const { result } = renderHook(() => useProfileData());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Change mock to return different data
    mockMatchesAPI.getMyPets.mockResolvedValue({
      data: [
        {
          _id: 'pet3',
          name: 'Max',
          species: 'dog',
          breed: 'Labrador',
        },
      ],
    });

    // Manually refresh
    act(() => {
      result.current.refreshProfile();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockMatchesAPI.getMyPets).toHaveBeenCalledTimes(2);
    expect(result.current.pets).toEqual([
      {
        _id: 'pet3',
        name: 'Max',
        species: 'dog',
        breed: 'Labrador',
      },
    ]);
  });

  it('should handle empty pets array', async () => {
    mockMatchesAPI.getMyPets.mockResolvedValue({
      data: [],
    });

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pets).toEqual([]);
    expect(mockLogger.info).toHaveBeenCalledWith('Profile data refreshed', {
      petCount: 0,
    });
  });

  it('should handle null/undefined pets data', async () => {
    mockMatchesAPI.getMyPets.mockResolvedValue({
      data: null,
    });

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pets).toEqual([]);
  });

  it('should not load data when disabled', async () => {
    const { result } = renderHook(() => useProfileData({ enabled: false }));

    // Wait a bit to ensure no API calls are made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.pets).toEqual([]);
    expect(mockMatchesAPI.getMyPets).not.toHaveBeenCalled();
  });

  it('should handle refresh when disabled', async () => {
    const { result } = renderHook(() => useProfileData({ enabled: false }));

    act(() => {
      result.current.refreshProfile();
    });

    // Wait a bit to ensure no API calls are made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isLoading).toBe(false);
    expect(mockMatchesAPI.getMyPets).not.toHaveBeenCalled();
  });

  it('should reset error state on successful refresh', async () => {
    // First make it fail
    mockMatchesAPI.getMyPets.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');

    // Then make it succeed
    mockMatchesAPI.getMyPets.mockResolvedValueOnce({
      data: [{ _id: 'pet1', name: 'Buddy', species: 'dog', breed: 'Golden' }],
    });

    act(() => {
      result.current.refreshProfile();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(result.current.pets).toEqual([
      { _id: 'pet1', name: 'Buddy', species: 'dog', breed: 'Golden' },
    ]);
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useProfileData());

    const firstRefresh = result.current.refreshProfile;

    rerender();

    expect(result.current.refreshProfile).toBe(firstRefresh);
  });
});
