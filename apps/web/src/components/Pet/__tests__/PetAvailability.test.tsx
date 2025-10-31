/**
 * PetAvailability Component Tests
 * Tests availability management UI component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import PetAvailability from '../PetAvailability';
import * as petHooks from '@/hooks/domains/pet';

jest.mock('@/hooks/domains/pet', () => ({
  usePetProfile: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PetAvailability Component', () => {
  const mockUpdateAvailability = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (petHooks.usePetProfile as jest.Mock).mockReturnValue({
      pet: {
        _id: 'pet1',
        name: 'Buddy',
        availability: {
          isAvailable: true,
          schedule: {
            monday: { available: true, times: ['Morning', 'Afternoon'] },
            tuesday: { available: true, times: ['Evening'] },
            wednesday: { available: false, times: [] },
            thursday: { available: true, times: ['Morning'] },
            friday: { available: true, times: ['Afternoon', 'Evening'] },
            saturday: { available: true, times: ['All Day'] },
            sunday: { available: false, times: [] },
          },
        },
      },
      loading: false,
      updateAvailability: mockUpdateAvailability,
    });
  });

  it('should render availability calendar', () => {
    render(<PetAvailability petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Monday/i)).toBeInTheDocument();
    expect(screen.getByText(/Sunday/i)).toBeInTheDocument();
  });

  it('should toggle edit mode', () => {
    render(<PetAvailability petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should update availability schedule', async () => {
    mockUpdateAvailability.mockResolvedValueOnce(undefined);

    render(<PetAvailability petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    fireEvent.click(mondayCheckbox);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateAvailability).toHaveBeenCalled();
    });
  });

  it('should display time slots', () => {
    render(<PetAvailability petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Morning/i)).toBeInTheDocument();
    expect(screen.getByText(/Afternoon/i)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    (petHooks.usePetProfile as jest.Mock).mockReturnValue({
      pet: null,
      loading: true,
      updateAvailability: mockUpdateAvailability,
    });

    render(<PetAvailability petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});

