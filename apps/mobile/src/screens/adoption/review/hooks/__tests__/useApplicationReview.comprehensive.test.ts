/**
 * useApplicationReview Comprehensive Hook Tests
 * Tests application loading, status updates, error handling, and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useApplicationReview } from '../useApplicationReview';
import { request } from '../../../../../services/api';
import { logger } from '@pawfectmatch/core';
import type { Application, ApplicationStatus } from '../../types';

// Mock dependencies
jest.mock('../../../../../services/api', () => ({
  request: jest.fn(),
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

describe('useApplicationReview Hook Tests', () => {
  const mockApplicationId = 'app-123';
  const mockApplication: Application = {
    id: 'app-123',
    applicantName: 'John Doe',
    applicantEmail: 'john@example.com',
    applicantPhone: '+1234567890',
    applicantLocation: 'New York, NY',
    applicantExperience: '5 years with cats',
    homeType: 'house',
    hasChildren: true,
    hasOtherPets: true,
    yardSize: 'large',
    workSchedule: 'Full-time, work from home',
    applicationDate: '2024-01-20T00:00:00Z',
    status: 'pending',
    petName: 'Fluffy',
    petPhoto: 'https://example.com/photo.jpg',
    notes: 'Great applicant',
    questions: [
      { question: 'Why do you want to adopt?', answer: 'Looking for a companion' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (request as jest.Mock).mockResolvedValue(mockApplication);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.application).toBeNull();
    });

    it('should load application on mount', async () => {
      renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith(
          `/api/adoption/applications/${mockApplicationId}`,
          { method: 'GET' },
        );
      });
    });
  });

  describe('Application Loading', () => {
    it('should load application successfully', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toEqual(mockApplication);
      expect(result.current.application?.id).toBe('app-123');
      expect(result.current.application?.petName).toBe('Fluffy');
    });

    it('should set loading to false after load completes', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading errors gracefully', async () => {
      const error = new Error('Network error');
      (request as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load application details');
      expect(logger.error).toHaveBeenCalledWith('Failed to load application:', { error });
    });

    it('should reload application when applicationId changes', async () => {
      const { rerender } = renderHook(
        ({ applicationId }) => useApplicationReview({ applicationId }),
        {
          initialProps: { applicationId: 'app-1' },
        },
      );

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith('/api/adoption/applications/app-1', { method: 'GET' });
      });

      rerender({ applicationId: 'app-2' });

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith('/api/adoption/applications/app-2', { method: 'GET' });
      });
    });
  });

  describe('Manual Reload', () => {
    it('should reload application when reload is called', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = (request as jest.Mock).mock.calls.length;

      await act(async () => {
        await result.current.reload();
      });

      expect(request).toHaveBeenCalledTimes(initialCallCount + 1);
      expect(request).toHaveBeenLastCalledWith(
        `/api/adoption/applications/${mockApplicationId}`,
        { method: 'GET' },
      );
    });

    it('should set loading state during reload', async () => {
      (request as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApplication), 100)),
      );

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.reload();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle reload errors gracefully', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (request as jest.Mock).mockRejectedValueOnce(new Error('Reload failed'));

      await act(async () => {
        await result.current.reload();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load application details');
    });
  });

  describe('Status Updates', () => {
    it('should update status to approved', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(request).toHaveBeenCalledWith(`/api/adoption/applications/${mockApplicationId}/review`, {
        method: 'POST',
        body: { status: 'approved' },
      });
    });

    it('should update status to rejected', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateStatus('rejected');
      });

      expect(request).toHaveBeenCalledWith(`/api/adoption/applications/${mockApplicationId}/review`, {
        method: 'POST',
        body: { status: 'rejected' },
      });
    });

    it('should update local application state after status update', async () => {
      (request as jest.Mock).mockResolvedValueOnce(mockApplication);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialStatus = result.current.application?.status;

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(result.current.application?.status).toBe('approved');
      expect(result.current.application?.status).not.toBe(initialStatus);
    });

    it('should show success alert after status update', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Application status updated to approved');
    });

    it('should handle status update errors gracefully', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (request as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to update application status');
      expect(logger.error).toHaveBeenCalledWith('Failed to update application status:', expect.any(Error));
    });

    it('should not update local state if update fails', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialStatus = result.current.application?.status;

      (request as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      // Status should remain unchanged on error
      expect(result.current.application?.status).toBe(initialStatus);
    });

    it('should handle multiple status updates', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(result.current.application?.status).toBe('approved');

      // Mock new application data with updated status
      const updatedApp = { ...mockApplication, status: 'rejected' as ApplicationStatus };
      (request as jest.Mock).mockResolvedValueOnce(updatedApp);

      await act(async () => {
        await result.current.updateStatus('rejected');
      });

      expect(result.current.application?.status).toBe('rejected');
    });

    it('should update status even when application is not loaded', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Application is null due to load failure
      expect(result.current.application).toBeNull();

      // Status update should still attempt (though it won't update local state)
      (request as jest.Mock).mockResolvedValueOnce({});

      await act(async () => {
        await result.current.updateStatus('approved');
      });

      expect(request).toHaveBeenCalledWith(`/api/adoption/applications/${mockApplicationId}/review`, {
        method: 'POST',
        body: { status: 'approved' },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null application response', async () => {
      (request as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toBeNull();
    });

    it('should handle undefined application response', async () => {
      (request as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toBeUndefined();
    });

    it('should handle network timeout', async () => {
      (request as jest.Mock).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100)),
      );

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toBeNull();
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should handle rapid status updates', async () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.updateStatus('approved'),
          result.current.updateStatus('rejected'),
          result.current.updateStatus('approved'),
        ]);
      });

      // Should handle all updates (last one wins for local state)
      expect(request).toHaveBeenCalledTimes(4); // 1 initial load + 3 updates
    });

    it('should handle empty applicationId', () => {
      const { result } = renderHook(() => useApplicationReview({ applicationId: '' }));

      expect(result.current.isLoading).toBe(true);
      // Should still attempt to load (will likely fail)
    });

    it('should handle very long applicationId', async () => {
      const longId = 'a'.repeat(1000);
      (request as jest.Mock).mockResolvedValueOnce(mockApplication);

      renderHook(() => useApplicationReview({ applicationId: longId }));

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith(`/api/adoption/applications/${longId}`, { method: 'GET' });
      });
    });
  });

  describe('Application Data Handling', () => {
    it('should handle application with minimal data', async () => {
      const minimalApp: Application = {
        id: 'app-minimal',
        applicantName: 'Minimal',
        applicantEmail: 'min@example.com',
        applicantPhone: '',
        applicantLocation: '',
        applicantExperience: '',
        homeType: '',
        hasChildren: false,
        hasOtherPets: false,
        yardSize: '',
        workSchedule: '',
        applicationDate: '2024-01-01T00:00:00Z',
        status: 'pending',
        petName: 'Pet',
        petPhoto: '',
        notes: '',
        questions: [],
      };

      (request as jest.Mock).mockResolvedValueOnce(minimalApp);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toEqual(minimalApp);
    });

    it('should handle application with all optional fields', async () => {
      const fullApp: Application = {
        ...mockApplication,
        applicantPhone: '+1234567890',
        applicantLocation: 'Los Angeles, CA',
        applicantExperience: '10 years with pets',
        homeType: 'house',
        hasChildren: true,
        hasOtherPets: true,
        yardSize: 'large',
        workSchedule: 'Full-time',
        questions: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ],
        notes: 'Very detailed notes',
      };

      (request as jest.Mock).mockResolvedValueOnce(fullApp);

      const { result } = renderHook(() => useApplicationReview({ applicationId: mockApplicationId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.application).toEqual(fullApp);
      expect(result.current.application?.questions).toHaveLength(2);
    });
  });
});

