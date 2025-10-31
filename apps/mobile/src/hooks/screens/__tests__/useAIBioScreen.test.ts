/**
 * useAIBioScreen Hook Tests
 * Comprehensive test coverage for the AI Bio Screen hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAIBioScreen } from '../useAIBioScreen';
import { useAIBio } from '../../domains/ai/useAIBio';
import { useAuthStore } from '@pawfectmatch/core';
import { api } from '../../../services/api';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
  })),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('../../domains/ai/useAIBio', () => ({
  useAIBio: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('../../../services/api', () => ({
  api: {
    getUserPets: jest.fn(),
    updatePet: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('useAIBioScreen', () => {
  const mockGoBack = jest.fn();
  const mockGenerateAIBio = jest.fn();
  const mockClearHistory = jest.fn();
  const mockUser = { _id: 'user123' };
  const mockUserPets = [{ _id: 'pet123' }];

  beforeEach(() => {
    jest.clearAllMocks();

    require('@react-navigation/native').useNavigation.mockReturnValue({
      goBack: mockGoBack,
    });

    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (useAIBio as jest.Mock).mockReturnValue({
      generateBio: mockGenerateAIBio,
      isGenerating: false,
      lastGeneratedBio: null,
      bioHistory: [],
      addToHistory: jest.fn(),
      clearHistory: mockClearHistory,
    });

    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://photo.jpg' }],
    });

    (api.getUserPets as jest.Mock).mockResolvedValue(mockUserPets);
    (api.updatePet as jest.Mock).mockResolvedValue({});
  });

  describe('Initial State', () => {
    it('should initialize with empty form values', () => {
      const { result } = renderHook(() => useAIBioScreen());

      expect(result.current.petName).toBe('');
      expect(result.current.petBreed).toBe('');
      expect(result.current.petAge).toBe('');
      expect(result.current.petPersonality).toBe('');
      expect(result.current.selectedTone).toBe('playful');
      expect(result.current.selectedPhoto).toBeNull();
    });

    it('should initialize with default tone', () => {
      const { result } = renderHook(() => useAIBioScreen());

      expect(result.current.selectedTone).toBe('playful');
    });

    it('should provide tones array', () => {
      const { result } = renderHook(() => useAIBioScreen());

      expect(result.current.tones).toHaveLength(5);
      expect(result.current.tones[0]).toHaveProperty('id');
      expect(result.current.tones[0]).toHaveProperty('label');
      expect(result.current.tones[0]).toHaveProperty('icon');
      expect(result.current.tones[0]).toHaveProperty('color');
    });
  });

  describe('Form State Management', () => {
    it('should update pet name', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
      });

      expect(result.current.petName).toBe('Max');
    });

    it('should update pet breed', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetBreed('Golden Retriever');
      });

      expect(result.current.petBreed).toBe('Golden Retriever');
    });

    it('should update pet age', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetAge('2 years');
      });

      expect(result.current.petAge).toBe('2 years');
    });

    it('should update pet personality', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetPersonality('Playful and energetic');
      });

      expect(result.current.petPersonality).toBe('Playful and energetic');
    });

    it('should update selected tone', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setSelectedTone('professional');
      });

      expect(result.current.selectedTone).toBe('professional');
    });

    it('should update selected photo', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setSelectedPhoto('file://photo.jpg');
      });

      expect(result.current.selectedPhoto).toBe('file://photo.jpg');
    });
  });

  describe('Image Picking', () => {
    it('should pick image successfully', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.pickImage();
      });

      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      expect(result.current.selectedPhoto).toBe('file://photo.jpg');
    });

    it('should handle permission denial', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.pickImage();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission needed',
        'We need camera roll permissions to analyze your pet photo',
      );
      expect(result.current.selectedPhoto).toBeNull();
    });

    it('should handle canceled image picker', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.pickImage();
      });

      expect(result.current.selectedPhoto).toBeNull();
    });
  });

  describe('Bio Generation', () => {
    it('should generate bio successfully', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
        result.current.setPetBreed('Golden Retriever');
        result.current.setPetAge('2');
        result.current.setPetPersonality('Playful, energetic');
        result.current.setSelectedTone('playful');
      });

      await act(async () => {
        await result.current.generateBio();
      });

      expect(mockGenerateAIBio).toHaveBeenCalledWith({
        petName: 'Max',
        keywords: ['Playful', 'energetic'],
        tone: 'playful',
        length: 'medium',
        petType: 'dog',
        age: 2,
        breed: 'Golden Retriever',
      });
    });

    it('should show alert when pet name is missing', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.generateBio();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Information',
        "Please enter your pet's name",
      );
      expect(mockGenerateAIBio).not.toHaveBeenCalled();
    });

    it('should trim pet name before generating', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('  Max  ');
        result.current.setPetBreed('Golden Retriever');
      });

      await act(async () => {
        await result.current.generateBio();
      });

      expect(mockGenerateAIBio).toHaveBeenCalledWith(
        expect.objectContaining({
          petName: 'Max',
        }),
      );
    });

    it('should parse personality keywords correctly', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
        result.current.setPetPersonality('Playful, energetic, loves treats');
      });

      await act(async () => {
        await result.current.generateBio();
      });

      expect(mockGenerateAIBio).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ['Playful', 'energetic', 'loves treats'],
        }),
      );
    });

    it('should filter empty personality keywords', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
        result.current.setPetPersonality('Playful, , energetic');
      });

      await act(async () => {
        await result.current.generateBio();
      });

      expect(mockGenerateAIBio).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ['Playful', 'energetic'],
        }),
      );
    });
  });

  describe('Bio Saving', () => {
    it('should save bio successfully', async () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBio as jest.Mock).mockReturnValue({
        generateBio: mockGenerateAIBio,
        isGenerating: false,
        lastGeneratedBio: mockBio,
        bioHistory: [mockBio],
        addToHistory: jest.fn(),
        clearHistory: mockClearHistory,
      });

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.saveBio();
      });

      expect(api.getUserPets).toHaveBeenCalled();
      expect(api.updatePet).toHaveBeenCalledWith('pet123', {
        description: 'Test bio',
      });
    });

    it('should handle save when no user pets exist', async () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBio as jest.Mock).mockReturnValue({
        generateBio: mockGenerateAIBio,
        isGenerating: false,
        lastGeneratedBio: mockBio,
        bioHistory: [mockBio],
        addToHistory: jest.fn(),
        clearHistory: mockClearHistory,
      });

      (api.getUserPets as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.saveBio();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Saved Locally',
        'Bio has been saved to your device',
      );
    });

    it('should handle save when no generated bio exists', async () => {
      (useAIBio as jest.Mock).mockReturnValue({
        generateBio: mockGenerateAIBio,
        isGenerating: false,
        lastGeneratedBio: null,
        bioHistory: [],
        addToHistory: jest.fn(),
        clearHistory: mockClearHistory,
      });

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.saveBio();
      });

      expect(api.getUserPets).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when handleGoBack is called', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.handleGoBack();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Form Clearing', () => {
    it('should clear all form fields', () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
        result.current.setPetBreed('Golden Retriever');
        result.current.setPetAge('2');
        result.current.setPetPersonality('Playful');
        result.current.setSelectedTone('professional');
        result.current.setSelectedPhoto('file://photo.jpg');
      });

      act(() => {
        result.current.clearForm();
      });

      expect(result.current.petName).toBe('');
      expect(result.current.petBreed).toBe('');
      expect(result.current.petAge).toBe('');
      expect(result.current.petPersonality).toBe('');
      expect(result.current.selectedTone).toBe('playful');
      expect(result.current.selectedPhoto).toBeNull();
      expect(mockClearHistory).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user', async () => {
      (useAuthStore as jest.Mock).mockReturnValue({
        user: null,
      });

      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBio as jest.Mock).mockReturnValue({
        generateBio: mockGenerateAIBio,
        isGenerating: false,
        lastGeneratedBio: mockBio,
        bioHistory: [mockBio],
        addToHistory: jest.fn(),
        clearHistory: mockClearHistory,
      });

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.saveBio();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Saved Locally',
        'Bio has been saved to your device',
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBio as jest.Mock).mockReturnValue({
        generateBio: mockGenerateAIBio,
        isGenerating: false,
        lastGeneratedBio: mockBio,
        bioHistory: [mockBio],
        addToHistory: jest.fn(),
        clearHistory: mockClearHistory,
      });

      (api.getUserPets as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useAIBioScreen());

      await act(async () => {
        await result.current.saveBio();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Saved Locally',
        'Bio has been saved to your device',
      );
    });

    it('should handle age parsing with non-numeric values', async () => {
      const { result } = renderHook(() => useAIBioScreen());

      act(() => {
        result.current.setPetName('Max');
        result.current.setPetAge('two years old');
      });

      await act(async () => {
        await result.current.generateBio();
      });

      expect(mockGenerateAIBio).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 1, // Should default to 1 when parseInt fails
        }),
      );
    });
  });
});
