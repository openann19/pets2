/**
 * PetVerification Component Tests
 * Tests pet verification UI component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import PetVerification from '../PetVerification';
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

describe('PetVerification Component', () => {
  const mockVerifyPet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (petHooks.usePetProfile as jest.Mock).mockReturnValue({
      pet: {
        _id: 'pet1',
        name: 'Buddy',
        isVerified: false,
        verificationStatus: 'unverified',
      },
      loading: false,
      verifyPet: mockVerifyPet,
    });
  });

  it('should render verification status', () => {
    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/verification/i)).toBeInTheDocument();
  });

  it('should display unverified status', () => {
    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/unverified/i)).toBeInTheDocument();
  });

  it('should display verified status', () => {
    (petHooks.usePetProfile as jest.Mock).mockReturnValue({
      pet: {
        _id: 'pet1',
        name: 'Buddy',
        isVerified: true,
        verificationStatus: 'verified',
      },
      loading: false,
      verifyPet: mockVerifyPet,
    });

    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('should submit microchip ID', async () => {
    mockVerifyPet.mockResolvedValueOnce(undefined);

    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    const microchipInput = screen.getByLabelText(/microchip/i);
    fireEvent.change(microchipInput, { target: { value: '123456789' } });

    const submitButton = screen.getByRole('button', { name: /submit|verify/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockVerifyPet).toHaveBeenCalledWith({
        microchipId: '123456789',
      });
    });
  });

  it('should upload vet document', async () => {
    mockVerifyPet.mockResolvedValueOnce(undefined);

    const file = new File(['test'], 'vet-cert.pdf', { type: 'application/pdf' });

    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    const fileInput = screen.getByLabelText(/document|upload/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitButton = screen.getByRole('button', { name: /submit|verify/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockVerifyPet).toHaveBeenCalledWith({
        vetDocument: expect.any(File),
      });
    });
  });

  it('should display privacy notice', () => {
    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/privacy|secure|confidential/i)).toBeInTheDocument();
  });

  it('should handle pending verification', () => {
    (petHooks.usePetProfile as jest.Mock).mockReturnValue({
      pet: {
        _id: 'pet1',
        name: 'Buddy',
        isVerified: false,
        verificationStatus: 'pending',
      },
      loading: false,
      verifyPet: mockVerifyPet,
    });

    render(<PetVerification petId="pet1" petName="Buddy" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
});

