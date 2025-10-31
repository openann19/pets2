/**
 * useAdoptionManagerScreen Comprehensive Hook Tests
 * Tests all state transitions, API interactions, error handling, animations, and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAdoptionManagerScreen } from '../useAdoptionManagerScreen';
import { adoptionAPI } from '../../../services/api';
import { logger } from '@pawfectmatch/core';
import type { PetListing, AdoptionApplication } from '../useAdoptionManagerScreen';

// Mock dependencies
jest.mock('../../../services/api', () => ({
  adoptionAPI: {
    getListings: jest.fn(),
    getApplications: jest.fn(),
  },
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useAdoptionManagerScreen Hook Tests', () => {
  const mockPetListings: PetListing[] = [
    {
      id: 'pet-1',
      name: 'Fluffy',
      species: 'Cat',
      breed: 'Persian',
      age: 3,
      status: 'active',
      photos: ['photo1.jpg'],
      applications: 5,
      views: 120,
      featured: true,
      listedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'pet-2',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 2,
      status: 'pending',
      photos: ['photo2.jpg'],
      applications: 2,
      views: 45,
      featured: false,
      listedAt: '2024-01-15T00:00:00Z',
    },
  ];

  const mockApplications: AdoptionApplication[] = [
    {
      id: 'app-1',
      petId: 'pet-1',
      petName: 'Fluffy',
      applicantName: 'John Doe',
      applicantEmail: 'john@example.com',
      status: 'pending',
      submittedAt: '2024-01-20T00:00:00Z',
      experience: '5 years with cats',
      livingSpace: 'House with garden',
      references: 3,
    },
    {
      id: 'app-2',
      petId: 'pet-1',
      petName: 'Fluffy',
      applicantName: 'Jane Smith',
      applicantEmail: 'jane@example.com',
      status: 'approved',
      submittedAt: '2024-01-19T00:00:00Z',
      experience: '10 years with pets',
      livingSpace: 'Apartment',
      references: 5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (adoptionAPI.getListings as jest.Mock).mockResolvedValue(mockPetListings);
    (adoptionAPI.getApplications as jest.Mock).mockResolvedValue(mockApplications);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      expect(result.current.activeTab).toBe('listings');
      expect(result.current.refreshing).toBe(false);
      expect(result.current.showStatusModal).toBe(false);
      expect(result.current.selectedPet).toBeNull();
      expect(result.current.isLoading).toBe(true); // Initially loading
      expect(result.current.error).toBeNull();
      expect(result.current.petListings).toEqual([]);
      expect(result.current.applications).toEqual([]);
    });

    it('should initialize animated values correctly', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      expect(result.current.tabScale1).toBeDefined();
      expect(result.current.tabScale2).toBeDefined();
      expect(result.current.tabAnimatedStyle1).toBeDefined();
      expect(result.current.tabAnimatedStyle2).toBeDefined();
    });
  });

  describe('Data Loading', () => {
    it('should load listings when activeTab is listings', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adoptionAPI.getListings).toHaveBeenCalledTimes(1);
      expect(result.current.petListings).toHaveLength(2);
      expect(result.current.petListings[0].name).toBe('Fluffy');
    });

    it('should load applications when activeTab is applications', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      // Switch to applications tab
      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adoptionAPI.getApplications).toHaveBeenCalled();
      expect(result.current.applications).toHaveLength(2);
    });

    it('should handle loading state correctly', async () => {
      (adoptionAPI.getListings as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPetListings), 100)),
      );

      const { result } = renderHook(() => useAdoptionManagerScreen());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set error when API call fails', async () => {
      const errorMessage = 'Network error';
      (adoptionAPI.getListings as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle API returning empty array', async () => {
      (adoptionAPI.getListings as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.petListings).toEqual([]);
    });
  });

  describe('Tab Switching', () => {
    it('should switch to listings tab', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('listings');
      });

      expect(result.current.activeTab).toBe('listings');
    });

    it('should switch to applications tab', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      expect(result.current.activeTab).toBe('applications');
    });

    it('should trigger animation when tab is pressed', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.handleTabPress('listings', result.current.tabScale1);
      });

      // Animation should be triggered
      expect(result.current.activeTab).toBe('listings');
    });

    it('should reload data when switching tabs', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCalls = (adoptionAPI.getListings as jest.Mock).mock.calls.length;

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adoptionAPI.getApplications).toHaveBeenCalled();
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh listings data', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCalls = (adoptionAPI.getListings as jest.Mock).mock.calls.length;

      await act(async () => {
        await result.current.onRefresh();
      });

      expect(adoptionAPI.getListings).toHaveBeenCalledTimes(initialCalls + 1);
      expect(result.current.refreshing).toBe(false);
    });

    it('should refresh applications data', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.onRefresh();
      });

      expect(adoptionAPI.getApplications).toHaveBeenCalled();
      expect(result.current.refreshing).toBe(false);
    });

    it('should set refreshing state during refresh', async () => {
      (adoptionAPI.getListings as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPetListings), 100)),
      );

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.onRefresh();
      });

      // Refreshing should be true immediately
      expect(result.current.refreshing).toBe(true);

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });
    });

    it('should handle refresh errors gracefully', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (adoptionAPI.getListings as jest.Mock).mockRejectedValueOnce(new Error('Refresh failed'));

      await act(async () => {
        await result.current.onRefresh();
      });

      expect(result.current.refreshing).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Status Change', () => {
    it('should update pet status', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pet = result.current.petListings[0];
      const newStatus = 'paused';

      act(() => {
        result.current.handleStatusChange(pet, newStatus);
      });

      const updatedPet = result.current.petListings.find((p) => p.id === pet.id);
      expect(updatedPet?.status).toBe(newStatus);
    });

    it('should close modal after status change', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setShowStatusModal(true);
        result.current.setSelectedPet(result.current.petListings[0]);
      });

      expect(result.current.showStatusModal).toBe(true);

      act(() => {
        result.current.handleStatusChange(result.current.petListings[0], 'paused');
      });

      expect(result.current.showStatusModal).toBe(false);
      expect(result.current.selectedPet).toBeNull();
    });

    it('should not update status if pet not found', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCount = result.current.petListings.length;
      const fakePet: PetListing = {
        id: 'non-existent',
        name: 'Fake',
        species: 'Dog',
        breed: 'Unknown',
        age: 0,
        status: 'active',
        photos: [],
        applications: 0,
        views: 0,
        featured: false,
        listedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.handleStatusChange(fakePet, 'paused');
      });

      expect(result.current.petListings.length).toBe(initialCount);
    });
  });

  describe('Application Actions', () => {
    it('should show alert when approving application', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const appId = result.current.applications[0].id;

      act(() => {
        result.current.handleApplicationAction(appId, 'approve');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Approve Application',
        'Are you sure you want to approve this application?',
        expect.any(Array),
      );
    });

    it('should show alert when rejecting application', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const appId = result.current.applications[0].id;

      act(() => {
        result.current.handleApplicationAction(appId, 'reject');
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reject Application',
        'Are you sure you want to reject this application?',
        expect.any(Array),
      );
    });

    it('should update application status when approved', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const appId = result.current.applications.find((a) => a.status === 'pending')?.id;
      if (!appId) return;

      // Mock Alert.alert to call the onPress callback
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const approveButton = buttons?.find((b: any) => b.text === 'Approve');
        if (approveButton?.onPress) {
          approveButton.onPress();
        }
      });

      act(() => {
        result.current.handleApplicationAction(appId, 'approve');
      });

      const updatedApp = result.current.applications.find((a) => a.id === appId);
      expect(updatedApp?.status).toBe('approved');
    });

    it('should update application status when rejected', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const appId = result.current.applications.find((a) => a.status === 'pending')?.id;
      if (!appId) return;

      // Mock Alert.alert to call the reject onPress callback
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const rejectButton = buttons?.find((b: any) => b.text === 'Reject');
        if (rejectButton?.onPress) {
          rejectButton.onPress();
        }
      });

      act(() => {
        result.current.handleApplicationAction(appId, 'reject');
      });

      const updatedApp = result.current.applications.find((a) => a.id === appId);
      expect(updatedApp?.status).toBe('rejected');
    });

    it('should not update application when alert is cancelled', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const appId = result.current.applications.find((a) => a.status === 'pending')?.id;
      if (!appId) return;

      const initialStatus = result.current.applications.find((a) => a.id === appId)?.status;

      // Mock Alert.alert to not call any button
      (Alert.alert as jest.Mock).mockImplementation(() => {});

      act(() => {
        result.current.handleApplicationAction(appId, 'approve');
      });

      const app = result.current.applications.find((a) => a.id === appId);
      expect(app?.status).toBe(initialStatus);
    });
  });

  describe('Status Helpers', () => {
    it('should return correct color for each status', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      expect(result.current.getStatusColor('active')).toBe('#10b981');
      expect(result.current.getStatusColor('pending')).toBe('#f59e0b');
      expect(result.current.getStatusColor('adopted')).toBe('#8b5cf6');
      expect(result.current.getStatusColor('paused')).toBe('#6b7280');
      expect(result.current.getStatusColor('approved')).toBe('#10b981');
      expect(result.current.getStatusColor('rejected')).toBe('#ef4444');
      expect(result.current.getStatusColor('unknown')).toBe('#6b7280');
    });

    it('should return correct icon for each status', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      expect(result.current.getStatusIcon('active')).toBe('✅');
      expect(result.current.getStatusIcon('pending')).toBe('⏳');
      expect(result.current.getStatusIcon('adopted')).toBe('🏠');
      expect(result.current.getStatusIcon('paused')).toBe('⏸️');
      expect(result.current.getStatusIcon('approved')).toBe('✅');
      expect(result.current.getStatusIcon('rejected')).toBe('❌');
      expect(result.current.getStatusIcon('unknown')).toBe('❓');
    });
  });

  describe('Modal State Management', () => {
    it('should open status modal', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setShowStatusModal(true);
      });

      expect(result.current.showStatusModal).toBe(true);
    });

    it('should close status modal', () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setShowStatusModal(true);
        result.current.setShowStatusModal(false);
      });

      expect(result.current.showStatusModal).toBe(false);
    });

    it('should set selected pet', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pet = result.current.petListings[0];

      act(() => {
        result.current.setSelectedPet(pet);
      });

      expect(result.current.selectedPet).toBe(pet);
    });

    it('should clear selected pet', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSelectedPet(result.current.petListings[0]);
        result.current.setSelectedPet(null);
      });

      expect(result.current.selectedPet).toBeNull();
    });
  });

  describe('Data Normalization', () => {
    it('should normalize listings with missing fields', async () => {
      const incompleteData = [
        {
          id: 'pet-incomplete',
          name: 'Incomplete',
          // Missing many fields
        },
        {
          _id: 'pet-alt-id', // Using _id instead of id
          species: 'Dog',
        },
      ];

      (adoptionAPI.getListings as jest.Mock).mockResolvedValue(incompleteData as any);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.petListings).toHaveLength(2);
      expect(result.current.petListings[0].name).toBe('Incomplete');
      expect(result.current.petListings[0].species).toBe('Unknown');
      expect(result.current.petListings[0].breed).toBe('Unknown');
      expect(result.current.petListings[0].age).toBe(0);
      expect(result.current.petListings[1].id).toBe('pet-alt-id');
    });

    it('should normalize applications with missing fields', async () => {
      const incompleteData = [
        {
          id: 'app-incomplete',
          petId: 'pet-1',
        },
        {
          _id: 'app-alt-id',
          applicant: { name: 'Test', email: 'test@example.com' },
        },
      ];

      (adoptionAPI.getApplications as jest.Mock).mockResolvedValue(incompleteData as any);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      act(() => {
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.applications).toHaveLength(2);
      expect(result.current.applications[0].applicantName).toBe('Pending Applicant');
      expect(result.current.applications[0].applicantEmail).toBe('unknown@example.com');
      expect(result.current.applications[1].id).toBe('app-alt-id');
    });

    it('should handle invalid status values', async () => {
      const invalidData = [
        {
          id: 'pet-invalid',
          name: 'Invalid Status',
          status: 'invalid-status',
        },
      ];

      (adoptionAPI.getListings as jest.Mock).mockResolvedValue(invalidData as any);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.petListings[0].status).toBe('pending'); // Default status
    });

    it('should handle non-array photos', async () => {
      const invalidData = [
        {
          id: 'pet-invalid-photos',
          name: 'Invalid Photos',
          photos: 'not-an-array',
        },
      ];

      (adoptionAPI.getListings as jest.Mock).mockResolvedValue(invalidData as any);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.petListings[0].photos).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid tab switching', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setActiveTab('applications');
        result.current.setActiveTab('listings');
        result.current.setActiveTab('applications');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activeTab).toBe('applications');
    });

    it('should handle multiple rapid status changes', async () => {
      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pet = result.current.petListings[0];

      act(() => {
        result.current.handleStatusChange(pet, 'paused');
        result.current.handleStatusChange(pet, 'active');
        result.current.handleStatusChange(pet, 'adopted');
      });

      const updatedPet = result.current.petListings.find((p) => p.id === pet.id);
      expect(updatedPet?.status).toBe('adopted');
    });

    it('should handle API timeout gracefully', async () => {
      (adoptionAPI.getListings as jest.Mock).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100)),
      );

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle null/undefined API responses', async () => {
      (adoptionAPI.getListings as jest.Mock).mockResolvedValue(null as any);

      const { result } = renderHook(() => useAdoptionManagerScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle null gracefully
      expect(Array.isArray(result.current.petListings)).toBe(true);
    });
  });
});

