/**
 * AI Components Integration Tests
 * Tests the complete AI Bio generation flow with all components working together
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PetInfoForm } from '../PetInfoForm';
import { ToneSelector } from '../ToneSelector';
import { BioResults } from '../BioResults';

// Mock all necessary modules
jest.mock('@/theme/unified-theme', () => ({
  Theme: {
    colors: {
      text: { primary: '#000000', secondary: '#666666' },
      status: { error: '#FF0000', success: '#28A745' },
      border: { medium: '#CCCCCC', light: '#E5E5E5' },
      background: { primary: '#FFFFFF' },
      primary: { '500': '#007AFF' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: {
      fontSize: { xs: 12, sm: 14, base: 16, xl: 20, '2xl': 24 },
      fontWeight: { medium: '500', semibold: '600', bold: '700' },
      lineHeight: { normal: 1.5, relaxed: 1.625 },
    },
    borderRadius: { md: 8, lg: 12, full: 9999 },
  },
}));

describe('AI Components Integration', () => {
  describe('Complete Form Flow', () => {
    it('allows user to fill out complete form', () => {
      const mockProps = {
        // Form state
        petName: 'Max',
        setPetName: jest.fn(),
        petBreed: 'Golden Retriever',
        setPetBreed: jest.fn(),
        petAge: '2 years old',
        setPetAge: jest.fn(),
        petPersonality: 'Very playful and energetic, loves fetch',
        setPetPersonality: jest.fn(),
        validationErrors: {},
        
        // Tone
        selectedTone: 'playful',
        setSelectedTone: jest.fn(),
      };

      render(<PetInfoForm {...mockProps} />);

      expect(screen.getByDisplayValue('Max')).toBeTruthy();
      expect(screen.getByDisplayValue('Golden Retriever')).toBeTruthy();
      expect(screen.getByDisplayValue('2 years old')).toBeTruthy();
      expect(screen.getByDisplayValue('Very playful and energetic, loves fetch')).toBeTruthy();
    });

    it('switches between tone options', () => {
      const mockSetTone = jest.fn();
      
      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockSetTone} />
      );

      expect(screen.getByText('Playful')).toBeTruthy();

      rerender(
        <ToneSelector selectedTone="professional" onToneSelect={mockSetTone} />
      );

      expect(screen.getByText('Professional')).toBeTruthy();
    });
  });

  describe('Form Validation Flow', () => {
    it('shows validation errors across all fields', () => {
      const mockProps = {
        petName: '',
        setPetName: jest.fn(),
        petBreed: '',
        setPetBreed: jest.fn(),
        petAge: '',
        setPetAge: jest.fn(),
        petPersonality: '',
        setPetPersonality: jest.fn(),
        validationErrors: {
          petName: 'Pet name is required',
          petBreed: 'Pet breed is required',
          petAge: 'Pet age is required',
          petPersonality: 'Pet personality is required',
        },
      };

      render(<PetInfoForm {...mockProps} />);

      expect(screen.getByText('Pet name is required')).toBeTruthy();
      expect(screen.getByText('Pet breed is required')).toBeTruthy();
      expect(screen.getByText('Pet age is required')).toBeTruthy();
      expect(screen.getByText('Pet personality is required')).toBeTruthy();
    });
  });

  describe('Bio Results Display', () => {
    it('displays generated bio with all metrics', () => {
      const mockBio = {
        bio: 'Meet Max, a playful Golden Retriever...',
        keywords: ['playful', 'friendly'],
        sentiment: { score: 0.85, label: 'Very Positive' },
        matchScore: 92,
        createdAt: new Date().toISOString(),
      };

      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Generated Bio')).toBeTruthy();
      expect(screen.getByText('Bio Analysis')).toBeTruthy();
      expect(screen.getByText('92/100')).toBeTruthy();
      expect(screen.getByText('Very Positive')).toBeTruthy();
    });
  });

  describe('Complete User Journey', () => {
    it('simulates complete AI Bio generation flow', async () => {
      // Step 1: Fill form
      const formProps = {
        petName: 'Max',
        setPetName: jest.fn(),
        petBreed: 'Golden Retriever',
        setPetBreed: jest.fn(),
        petAge: '2 years',
        setPetAge: jest.fn(),
        petPersonality: 'Playful and energetic',
        setPetPersonality: jest.fn(),
        validationErrors: {},
      };

      render(<PetInfoForm {...formProps} />);

      expect(screen.getByDisplayValue('Max')).toBeTruthy();

      // Step 2: Select tone
      render(<ToneSelector selectedTone="playful" onToneSelect={jest.fn()} />);
      expect(screen.getByText('Playful')).toBeTruthy();

      // Step 3: View results
      const mockBio = {
        bio: 'Generated bio text',
        keywords: ['keyword'],
        sentiment: { score: 0.8, label: 'Positive' },
        matchScore: 88,
        createdAt: new Date().toISOString(),
      };

      render(<BioResults generatedBio={mockBio} />);
      expect(screen.getByText('Generated Bio')).toBeTruthy();
      expect(screen.getByText('88/100')).toBeTruthy();
    });
  });

  describe('Component State Management', () => {
    it('maintains form state across component updates', () => {
      const mockProps = {
        petName: 'Max',
        setPetName: jest.fn(),
        petBreed: 'Golden Retriever',
        setPetBreed: jest.fn(),
        petAge: '2 years',
        setPetAge: jest.fn(),
        petPersonality: 'Playful',
        setPetPersonality: jest.fn(),
        validationErrors: {},
      };

      const { rerender } = render(<PetInfoForm {...mockProps} />);

      expect(screen.getByDisplayValue('Max')).toBeTruthy();

      const updatedProps = { ...mockProps, petName: 'Maximus' };
      rerender(<PetInfoForm {...updatedProps} />);

      expect(screen.getByDisplayValue('Maximus')).toBeTruthy();
    });

    it('updates tone selection properly', () => {
      const mockSetTone = jest.fn();

      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockSetTone} />
      );

      expect(screen.getByText('Playful')).toBeTruthy();

      rerender(
        <ToneSelector selectedTone="professional" onToneSelect={mockSetTone} />
      );

      expect(screen.getByText('Professional')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles validation errors and recovery', () => {
      const errorProps = {
        petName: '',
        setPetName: jest.fn(),
        petBreed: '',
        setPetBreed: jest.fn(),
        petAge: '',
        setPetAge: jest.fn(),
        petPersonality: '',
        setPetPersonality: jest.fn(),
        validationErrors: {
          petName: 'Pet name is required',
        },
      };

      render(<PetInfoForm {...errorProps} />);
      expect(screen.getByText('Pet name is required')).toBeTruthy();

      // Recovery: Fill the field
      const validProps = {
        ...errorProps,
        petName: 'Max',
        validationErrors: {},
      };

      const { rerender } = render(<PetInfoForm {...errorProps} />);
      rerender(<PetInfoForm {...validProps} />);

      expect(screen.queryByText('Pet name is required')).toBeFalsy();
    });
  });
});

