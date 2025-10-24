import { renderHook, act } from '@testing-library/react';
import { useSwipe } from './useSwipe';
import { petsAPI } from '../services/api';
import { Pet } from '../types';

// Mock the petsAPI
jest.mock('../services/api', () => ({
  petsAPI: {
    discoverPets: jest.fn(),
    swipePet: jest.fn(),
  },
}));

const mockPet1: Pet = { _id: 'pet1', name: 'Buddy', species: 'dog', breed: 'Golden Retriever', age: 3, gender: 'male', size: 'large', intent: 'playdate', photos: [], personalityTags: [], healthInfo: { vaccinated: true, spayedNeutered: true, microchipped: false }, location: { type: 'Point', coordinates: [0,0] }, featured: { isFeatured: false, boostCount: 0 }, analytics: { views: 0, likes: 0, matches: 0, messages: 0 }, isActive: true, status: 'active', availability: { isAvailable: true }, isVerified: true, listedAt: '', createdAt: '', updatedAt: '', owner: 'user1' };
const mockPet2: Pet = { ...mockPet1, _id: 'pet2', name: 'Lucy' };

describe('useSwipe Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (petsAPI.discoverPets as jest.Mock).mockClear();
    (petsAPI.swipePet as jest.Mock).mockClear();
  });

  it('should fetch and store pets on initial load', async () => {
    (petsAPI.discoverPets as jest.Mock).mockResolvedValueOnce({
      data: {
        pets: [mockPet1, mockPet2],
        pagination: { hasMore: true },
      },
    });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets.length).toBe(2);
    expect(result.current.pets[0].name).toBe('Buddy');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle swiping a pet and remove it from the list', async () => {
    (petsAPI.discoverPets as jest.Mock).mockResolvedValueOnce({
        data: { pets: [mockPet1, mockPet2], pagination: { hasMore: true } },
    });
    (petsAPI.swipePet as jest.Mock).mockResolvedValueOnce({
        data: { isMatch: false, action: 'like' },
    });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets.length).toBe(2);

    await act(async () => {
      await result.current.swipePet('pet1', 'like');
    });

    expect(petsAPI.swipePet).toHaveBeenCalledWith('pet1', 'like');
    expect(result.current.pets.length).toBe(1);
    expect(result.current.pets[0].name).toBe('Lucy');
  });

  it('should handle loading more pets', async () => {
    (petsAPI.discoverPets as jest.Mock)
      .mockResolvedValueOnce({ data: { pets: [mockPet1], pagination: { hasMore: true } } })
      .mockResolvedValueOnce({ data: { pets: [mockPet2], pagination: { hasMore: false } } });

    const { result } = renderHook(() => useSwipe());

    await act(async () => {
      await result.current.loadPets();
    });

    expect(result.current.pets.length).toBe(1);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
        await result.current.loadPets();
    });

    expect(result.current.pets.length).toBe(2);
    expect(result.current.hasMore).toBe(false);
  });
});
