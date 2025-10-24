/**
 * Web AI Components Test Suite
 * Comprehensive tests for web AI bio generation components
 * Validates web-specific implementations and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../../lib/utils', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}));

// Mock the hook
const mockUseWebAIBio = {
  petName: 'Buddy',
  setPetName: jest.fn(),
  petBreed: 'Golden Retriever',
  setPetBreed: jest.fn(),
  petAge: '2 years',
  setPetAge: jest.fn(),
  petPersonality: 'Friendly and energetic',
  setPetPersonality: jest.fn(),
  selectedTone: 'playful',
  setSelectedTone: jest.fn(),
  selectedPhoto: null,
  setSelectedPhoto: jest.fn(),
  isGenerating: false,
  generatedBio: null,
  bioHistory: [],
  generateBio: jest.fn(),
  pickImage: jest.fn(),
  saveBio: jest.fn(),
  clearForm: jest.fn(),
  resetGeneration: jest.fn(),
  isFormValid: true,
  validationErrors: {},
};

jest.mock('../../../hooks/useWebAIBio', () => ({
  useWebAIBio: () => mockUseWebAIBio,
}));

describe('PetInfoForm Component', () => {
  const { PetInfoForm } = require('../PetInfoForm');

  const defaultProps = {
    petName: 'Buddy',
    onPetNameChange: jest.fn(),
    petBreed: 'Golden Retriever',
    onPetBreedChange: jest.fn(),
    petAge: '2 years',
    onPetAgeChange: jest.fn(),
    petPersonality: 'Friendly and energetic',
    onPetPersonalityChange: jest.fn(),
    validationErrors: {},
    onSubmit: jest.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<PetInfoForm {...defaultProps} />);

    expect(screen.getByText('Pet Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/pet name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pet breed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pet age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pet personality/i)).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: {
        petName: 'Pet name is required',
        petBreed: 'Pet breed is required',
      },
    };

    render(<PetInfoForm {...propsWithErrors} />);

    expect(screen.getByText('Pet name is required')).toBeInTheDocument();
    expect(screen.getByText('Pet breed is required')).toBeInTheDocument();
  });

  it('shows character count for personality field', () => {
    render(<PetInfoForm {...defaultProps} />);

    expect(screen.getByText('23/500 characters')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<PetInfoForm {...defaultProps} />);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('calls change handlers when inputs change', () => {
    render(<PetInfoForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/pet name/i);
    fireEvent.change(nameInput, { target: { value: 'Max' } });

    expect(defaultProps.onPetNameChange).toHaveBeenCalledWith('Max');
  });

  it('disables submit button when submitting', () => {
    render(<PetInfoForm {...defaultProps} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /continue/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/processing/i);
  });
});

describe('ToneSelector Component', () => {
  const { ToneSelector } = require('../ToneSelector');

  it('renders all tone options', () => {
    render(<ToneSelector selectedTone="playful" onToneSelect={jest.fn()} />);

    expect(screen.getByText('Playful')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByText('Romantic')).toBeInTheDocument();
    expect(screen.getByText('Mysterious')).toBeInTheDocument();
  });

  it('shows selected state for chosen tone', () => {
    render(<ToneSelector selectedTone="professional" onToneSelect={jest.fn()} />);

    const professionalCard = screen.getByText('Professional').closest('button');
    expect(professionalCard).toHaveClass('border-blue-600');
  });

  it('calls onToneSelect when tone is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<ToneSelector selectedTone="playful" onToneSelect={mockOnSelect} />);

    const romanticCard = screen.getByText('Romantic').closest('button');
    fireEvent.click(romanticCard!);

    expect(mockOnSelect).toHaveBeenCalledWith('romantic');
  });

  it('displays tone descriptions', () => {
    render(<ToneSelector selectedTone="playful" onToneSelect={jest.fn()} />);

    expect(screen.getByText('Fun and energetic personality')).toBeInTheDocument();
    expect(screen.getByText('Polite and well-mannered')).toBeInTheDocument();
  });
});

describe('BioResults Component', () => {
  const { BioResults } = require('../BioResults');

  const mockBio = {
    bio: 'Buddy is a friendly Golden Retriever who loves belly rubs and long walks in the park.',
    keywords: ['friendly', 'energetic', 'loves walks'],
    sentiment: {
      score: 0.8,
      label: 'Positive',
    },
    matchScore: 85,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bio content', () => {
    render(<BioResults generatedBio={mockBio} />);

    expect(screen.getByText(mockBio.bio)).toBeInTheDocument();
  });

  it('displays analysis metrics', () => {
    render(<BioResults generatedBio={mockBio} />);

    expect(screen.getByText('Bio Analysis')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
  });

  it('shows keywords as tags', () => {
    render(<BioResults generatedBio={mockBio} />);

    mockBio.keywords.forEach(keyword => {
      expect(screen.getByText(keyword)).toBeInTheDocument();
    });
  });

  it('calls onSave when save button is clicked', () => {
    const mockOnSave = jest.fn();
    render(<BioResults generatedBio={mockBio} onSave={mockOnSave} />);

    const saveButton = screen.getByText('Save Bio').closest('button');
    fireEvent.click(saveButton!);

    expect(mockOnSave).toHaveBeenCalledWith(mockBio);
  });

  it('calls onRegenerate when regenerate button is clicked', () => {
    const mockOnRegenerate = jest.fn();
    render(<BioResults generatedBio={mockBio} onRegenerate={mockOnRegenerate} />);

    const regenerateButton = screen.getByText('Generate New').closest('button');
    fireEvent.click(regenerateButton!);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });

  it('copies bio to clipboard when copy button is clicked', async () => {
    const { copyToClipboard } = require('../../../lib/utils');
    render(<BioResults generatedBio={mockBio} />);

    const copyButton = screen.getByText('Copy Bio').closest('button');
    fireEvent.click(copyButton!);

    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith(mockBio.bio);
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows sentiment score percentage', () => {
    render(<BioResults generatedBio={mockBio} />);

    expect(screen.getByText('Score: 80%')).toBeInTheDocument();
  });
});

describe('useWebAIBio Hook', () => {
  const { renderHook, act } = require('@testing-library/react-hooks');
  const { useWebAIBio } = require('../../../hooks/useWebAIBio');

  // Mock webApiClient
  const mockWebApiClient = {
    post: jest.fn(),
  };

  jest.mock('../../../lib/api-client', () => ({
    webApiClient: mockWebApiClient,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebApiClient.post.mockResolvedValue({
      success: true,
      data: {
        bio: 'Test bio',
        keywords: ['test'],
        sentiment: { score: 0.5, label: 'Neutral' },
        matchScore: 75,
      },
    });
  });

  it('validates form correctly', () => {
    const { result } = renderHook(() => useWebAIBio());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetBreed('Golden Retriever');
      result.current.setPetAge('2 years');
      result.current.setPetPersonality('Friendly');
    });

    expect(result.current.isFormValid).toBe(true);
    expect(result.current.validationErrors).toEqual({});
  });

  it('shows validation errors for empty fields', () => {
    const { result } = renderHook(() => useWebAIBio());

    act(() => {
      result.current.generateBio();
    });

    expect(result.current.validationErrors.petName).toBeDefined();
    expect(result.current.validationErrors.petBreed).toBeDefined();
  });

  it('generates bio successfully', async () => {
    const { result } = renderHook(() => useWebAIBio());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetBreed('Golden Retriever');
      result.current.setPetAge('2 years');
      result.current.setPetPersonality('Friendly');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(result.current.generatedBio).toBeTruthy();
    expect(result.current.generatedBio?.bio).toBe('Test bio');
  });

  it('handles generation errors', async () => {
    mockWebApiClient.post.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useWebAIBio());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetBreed('Golden Retriever');
      result.current.setPetAge('2 years');
      result.current.setPetPersonality('Friendly');
    });

    await act(async () => {
      try {
        await result.current.generateBio();
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.validationErrors.submit).toBeDefined();
  });

  it('manages form state correctly', () => {
    const { result } = renderHook(() => useWebAIBio());

    act(() => {
      result.current.setPetName('Max');
      result.current.setPetBreed('Labrador');
      result.current.setSelectedTone('professional');
    });

    expect(result.current.petName).toBe('Max');
    expect(result.current.petBreed).toBe('Labrador');
    expect(result.current.selectedTone).toBe('professional');
  });
});
