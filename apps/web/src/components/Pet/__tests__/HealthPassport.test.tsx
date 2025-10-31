/**
 * HealthPassport Component Tests
 * Tests health record management UI component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import HealthPassport from '../HealthPassport';
import * as petHooks from '@/hooks/domains/pet';

// Mock the hooks
jest.mock('@/hooks/domains/pet', () => ({
  useHealthPassport: jest.fn(),
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

const mockHealthData = {
  vaccines: [
    {
      id: 'v1',
      type: 'rabies',
      name: 'Rabies Vaccine',
      administeredAt: '2024-01-01',
      vetName: 'Dr. Smith',
    },
  ],
  medications: [
    {
      id: 'm1',
      name: 'Heartworm Prevention',
      dosage: '1 tablet',
      frequency: 'Monthly',
      prescribedAt: '2024-01-01',
      vetName: 'Dr. Smith',
    },
  ],
};

describe('HealthPassport Component', () => {
  const mockAddVaccine = jest.fn();
  const mockAddMedication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (petHooks.useHealthPassport as jest.Mock).mockReturnValue({
      healthData: mockHealthData,
      reminders: [],
      loading: false,
      addVaccineRecord: mockAddVaccine,
      addMedicationRecord: mockAddMedication,
      refetch: jest.fn(),
    });
  });

  it('should render health passport with tabs', () => {
    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Vaccines/i)).toBeInTheDocument();
    expect(screen.getByText(/Medications/i)).toBeInTheDocument();
    expect(screen.getByText(/Reminders/i)).toBeInTheDocument();
  });

  it('should display vaccine records', () => {
    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Rabies Vaccine/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Smith/i)).toBeInTheDocument();
  });

  it('should display medication records', () => {
    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText(/Medications/i));

    expect(screen.getByText(/Heartworm Prevention/i)).toBeInTheDocument();
  });

  it('should open add vaccine modal', () => {
    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    const addButton = screen.getByRole('button', { name: /add.*vaccine/i });
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/vaccine name/i)).toBeInTheDocument();
  });

  it('should submit vaccine form', async () => {
    mockAddVaccine.mockResolvedValueOnce(undefined);

    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByRole('button', { name: /add.*vaccine/i }));

    const nameInput = screen.getByLabelText(/vaccine name/i);
    const typeInput = screen.getByLabelText(/type/i);
    const dateInput = screen.getByLabelText(/administered/i);

    fireEvent.change(nameInput, { target: { value: 'DHPP' } });
    fireEvent.change(typeInput, { target: { value: 'dhpp' } });
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    const submitButton = screen.getByRole('button', { name: /submit|add|save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddVaccine).toHaveBeenCalled();
    });
  });

  it('should display loading state', () => {
    (petHooks.useHealthPassport as jest.Mock).mockReturnValue({
      healthData: null,
      reminders: [],
      loading: true,
      addVaccineRecord: mockAddVaccine,
      addMedicationRecord: mockAddMedication,
      refetch: jest.fn(),
    });

    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display reminders when available', () => {
    (petHooks.useHealthPassport as jest.Mock).mockReturnValue({
      healthData: mockHealthData,
      reminders: [
        {
          type: 'vaccine',
          title: 'Rabies Booster Due',
          dueDate: '2024-06-01',
          isOverdue: false,
        },
      ],
      loading: false,
      addVaccineRecord: mockAddVaccine,
      addMedicationRecord: mockAddMedication,
      refetch: jest.fn(),
    });

    render(<HealthPassport petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText(/Reminders/i));

    expect(screen.getByText(/Rabies Booster Due/i)).toBeInTheDocument();
  });
});

