/**
 * Comprehensive Tests for Pet Domain Hooks
 * Tests all pet management hooks with React Query integration
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  usePetProfile,
  usePets,
  usePlaydateMatching,
  useHealthPassport,
  useLostPetAlert,
} from '../index';
import apiClient from '@/lib/api-client';
import type { Pet } from '@/types';

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    getPet: jest.fn(),
    updatePet: jest.fn(),
    createPet: jest.fn(),
    getMyPets: jest.fn(),
    getOwnerPets: jest.fn(),
    setPrimaryPet: jest.fn(),
    addPetHealthRecord: jest.fn(),
    getPetHealth: jest.fn(),
    addPetVaccine: jest.fn(),
    addPetMedication: jest.fn(),
    verifyPet: jest.fn(),
    getPlaydateMatches: jest.fn(),
    createPlaydate: jest.fn(),
    createLostPetAlert: jest.fn(),
    updateLostPetAlert: jest.fn(),
    reportLostPetSighting: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data
const mockPet: Pet = {
  _id: 'pet1',
  id: 'pet1',
  owner: 'user1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male',
  size: 'large',
  photos: [],
  personalityTags: [],
  intent: 'playdate',
  healthInfo: {
    vaccinated: true,
    spayedNeutered: true,
    microchipped: false,
  },
  location: {
    type: 'Point',
    coordinates: [0, 0],
  },
  featured: {
    isFeatured: false,
    boostCount: 0,
  },
  analytics: {
    views: 0,
    likes: 0,
    matches: 0,
    messages: 0,
  },
  isActive: true,
  status: 'active',
  availability: {
    isAvailable: true,
  },
  isVerified: true,
  listedAt: '2024-01-01',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockVaccineRecord = {
  type: 'rabies',
  administeredAt: '2024-01-01',
  vetName: 'Dr. Smith',
  id: 'v1',
  name: 'Rabies Vaccine',
};

const mockMedicationRecord = {
  name: 'Heartworm Prevention',
  dosage: '1 tablet',
  frequency: 'Monthly',
  prescribedAt: '2024-01-01',
  vetName: 'Dr. Smith',
  id: 'm1',
};

const mockPlaydateMatch = {
  id: 'match1',
  pet1: mockPet,
  pet2: { ...mockPet, _id: 'pet2', name: 'Lucy' },
  compatibilityScore: 85,
  compatibilityFactors: {
    playStyle: 20,
    energy: 20,
    size: 15,
    sociability: 15,
    location: 15,
  },
  recommendedActivities: ['Fetch', 'Walking'],
  distanceKm: 2.5,
};

const mockHealthData = {
  records: {
    vaccines: [mockVaccineRecord],
    medications: [mockMedicationRecord],
  },
  reminders: [
    {
      type: 'vaccine' as const,
      title: 'Rabies Booster',
      dueDate: '2024-06-01',
      isOverdue: false,
    },
  ],
};

const mockLostPetAlert = {
  id: 'alert1',
  petId: 'pet1',
  lastSeenLocation: {
    lat: 37.7749,
    lng: -122.4194,
    address: '123 Main St, San Francisco, CA',
  },
  description: 'Lost golden retriever',
  status: 'active' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('Pet Domain Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePetProfile', () => {
    it('should fetch pet profile successfully', async () => {
      (apiClient.getPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPet,
      });

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pet).toEqual(mockPet);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading state', () => {
      (apiClient.getPet as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.pet).toBeNull();
    });

    it('should handle error state', async () => {
      (apiClient.getPet as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Pet not found',
      });

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pet).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should update pet successfully', async () => {
      const updatedPet = { ...mockPet, name: 'Buddy Updated' };
      (apiClient.getPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPet,
      });
      (apiClient.updatePet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedPet,
      });

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.pet).toBeTruthy();
      });

      await act(async () => {
        await result.current.updatePet({ name: 'Buddy Updated' });
      });

      expect(apiClient.updatePet).toHaveBeenCalledWith('pet1', {
        name: 'Buddy Updated',
      });
    });

    it('should add health record', async () => {
      (apiClient.getPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPet,
      });
      (apiClient.addPetHealthRecord as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockVaccineRecord,
      });

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.pet).toBeTruthy();
      });

      await act(async () => {
        await result.current.addHealthRecord('vaccine', mockVaccineRecord);
      });

      expect(apiClient.addPetHealthRecord).toHaveBeenCalledWith(
        'pet1',
        'vaccine',
        mockVaccineRecord
      );
    });

    it('should verify pet', async () => {
      const verifiedPet = { ...mockPet, isVerified: true };
      (apiClient.getPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPet,
      });
      (apiClient.verifyPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: verifiedPet,
      });

      const { result } = renderHook(() => usePetProfile('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.pet).toBeTruthy();
      });

      await act(async () => {
        await result.current.verifyPet({ microchipId: '123456' });
      });

      expect(apiClient.verifyPet).toHaveBeenCalledWith('pet1', {
        microchipId: '123456',
      });
    });

    it('should not fetch when petId is undefined', () => {
      const { result } = renderHook(() => usePetProfile(), {
        wrapper: createWrapper(),
      });

      expect(apiClient.getPet).not.toHaveBeenCalled();
      expect(result.current.pet).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('usePets', () => {
    it('should fetch user pets successfully', async () => {
      (apiClient.getMyPets as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockPet],
      });

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pets).toEqual([mockPet]);
      expect(result.current.error).toBeNull();
    });

    it('should fetch owner pets when ownerId provided', async () => {
      (apiClient.getOwnerPets as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockPet],
      });

      const { result } = renderHook(() => usePets('owner1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getOwnerPets).toHaveBeenCalledWith('owner1');
      expect(result.current.pets).toEqual([mockPet]);
    });

    it('should create pet successfully', async () => {
      (apiClient.getMyPets as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [],
      });
      (apiClient.createPet as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockPet,
      });

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createPet({
          name: 'Buddy',
          species: 'dog',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'male',
          size: 'large',
          photos: [],
          personalityTags: [],
          intent: 'playdate',
          healthInfo: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: false,
          },
          location: {
            type: 'Point',
            coordinates: [0, 0],
          },
          featured: {
            isFeatured: false,
            boostCount: 0,
          },
          analytics: {
            views: 0,
            likes: 0,
            matches: 0,
            messages: 0,
          },
          isActive: true,
          status: 'active',
          availability: {
            isAvailable: true,
          },
          isVerified: false,
          listedAt: '2024-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        });
      });

      expect(apiClient.createPet).toHaveBeenCalled();
    });

    it('should set primary pet', async () => {
      (apiClient.getMyPets as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockPet],
      });
      (apiClient.setPrimaryPet as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setPrimaryPet('pet1');
      });

      expect(apiClient.setPrimaryPet).toHaveBeenCalledWith('pet1');
    });
  });

  describe('usePlaydateMatching', () => {
    it('should find playdate matches successfully', async () => {
      (apiClient.getPlaydateMatches as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: [mockPlaydateMatch],
      });

      const { result } = renderHook(() => usePlaydateMatching('pet1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.findMatches({
          distance: 10,
          energy: 4,
        });
      });

      expect(apiClient.getPlaydateMatches).toHaveBeenCalledWith('pet1', {
        distance: 10,
        energy: 4,
      });
      expect(result.current.matches).toEqual([mockPlaydateMatch]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle loading state during match search', async () => {
      (apiClient.getPlaydateMatches as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => usePlaydateMatching('pet1'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.findMatches();
      });

      expect(result.current.loading).toBe(true);
    });

    it('should create playdate successfully', async () => {
      (apiClient.createPlaydate as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => usePlaydateMatching('pet1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createPlaydate('match1', {
          scheduledAt: '2024-06-01T10:00:00Z',
          venueId: 'venue1',
          notes: 'Bring water',
        });
      });

      expect(apiClient.createPlaydate).toHaveBeenCalledWith('match1', {
        scheduledAt: '2024-06-01T10:00:00Z',
        venueId: 'venue1',
        notes: 'Bring water',
      });
    });

    it('should handle errors when finding matches', async () => {
      (apiClient.getPlaydateMatches as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'No matches found',
      });

      const { result } = renderHook(() => usePlaydateMatching('pet1'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.findMatches();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.matches).toEqual([]);
    });
  });

  describe('useHealthPassport', () => {
    it('should fetch health data successfully', async () => {
      (apiClient.getPetHealth as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockHealthData,
      });

      const { result } = renderHook(() => useHealthPassport('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.healthData).toEqual(mockHealthData.records);
      expect(result.current.reminders).toEqual(mockHealthData.reminders);
    });

    it('should add vaccine record', async () => {
      (apiClient.getPetHealth as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockHealthData,
      });
      (apiClient.addPetVaccine as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockVaccineRecord,
      });

      const { result } = renderHook(() => useHealthPassport('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addVaccineRecord(mockVaccineRecord);
      });

      expect(apiClient.addPetVaccine).toHaveBeenCalledWith(
        'pet1',
        mockVaccineRecord
      );
    });

    it('should add medication record', async () => {
      (apiClient.getPetHealth as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockHealthData,
      });
      (apiClient.addPetMedication as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockMedicationRecord,
      });

      const { result } = renderHook(() => useHealthPassport('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addMedicationRecord(mockMedicationRecord);
      });

      expect(apiClient.addPetMedication).toHaveBeenCalledWith(
        'pet1',
        mockMedicationRecord
      );
    });

    it('should handle empty health data', async () => {
      (apiClient.getPetHealth as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          records: {},
          reminders: [],
        },
      });

      const { result } = renderHook(() => useHealthPassport('pet1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.healthData).toEqual({});
      expect(result.current.reminders).toEqual([]);
    });
  });

  describe('useLostPetAlert', () => {
    it('should create lost pet alert successfully', async () => {
      (apiClient.createLostPetAlert as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockLostPetAlert,
      });

      const { result } = renderHook(() => useLostPetAlert(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.createAlert({
          petId: 'pet1',
          lastSeenLocation: {
            lat: 37.7749,
            lng: -122.4194,
            address: '123 Main St',
          },
          description: 'Lost golden retriever',
          reward: 500,
          broadcastRadius: 5,
        });
      });

      expect(apiClient.createLostPetAlert).toHaveBeenCalled();
      expect(result.current.activeAlert).toEqual(mockLostPetAlert);
    });

    it('should update lost pet alert', async () => {
      const updatedAlert = {
        ...mockLostPetAlert,
        description: 'Updated description',
      };
      (apiClient.updateLostPetAlert as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedAlert,
      });

      const { result } = renderHook(() => useLostPetAlert(), {
        wrapper: createWrapper(),
      });

      // Set active alert first
      (result.current as any).activeAlert = mockLostPetAlert;

      await act(async () => {
        await result.current.updateAlert('alert1', {
          description: 'Updated description',
        });
      });

      expect(apiClient.updateLostPetAlert).toHaveBeenCalledWith('alert1', {
        description: 'Updated description',
      });
    });

    it('should report sighting', async () => {
      (apiClient.reportLostPetSighting as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const { result } = renderHook(() => useLostPetAlert(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.reportSighting('alert1', {
          location: {
            lat: 37.7750,
            lng: -122.4195,
            address: '456 Oak St',
          },
          description: 'Saw a golden retriever matching description',
          photos: ['photo1.jpg'],
        });
      });

      expect(apiClient.reportLostPetSighting).toHaveBeenCalledWith('alert1', {
        location: {
          lat: 37.7750,
          lng: -122.4195,
          address: '456 Oak St',
        },
        description: 'Saw a golden retriever matching description',
        photos: ['photo1.jpg'],
      });
    });

    it('should handle error when creating alert', async () => {
      (apiClient.createLostPetAlert as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Failed to create alert',
      });

      const { result } = renderHook(() => useLostPetAlert(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.createAlert({
            petId: 'pet1',
            lastSeenLocation: {
              lat: 37.7749,
              lng: -122.4194,
              address: '123 Main St',
            },
            description: 'Lost pet',
          });
        } catch (error) {
          expect(error).toBeTruthy();
        }
      });

      expect(result.current.activeAlert).toBeNull();
    });
  });
});

