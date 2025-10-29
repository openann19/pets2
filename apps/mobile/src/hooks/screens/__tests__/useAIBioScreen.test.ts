/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAIBioScreen } from '../useAIBioScreen';
import * as ImagePicker from 'expo-image-picker';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
} as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock auth store
const mockUser = {
  _id: 'user123',
  name: 'Test User',
};

jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({ user: mockUser }),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock API
const mockGetUserPets = jest.fn();
const mockUpdatePet = jest.fn();

jest.mock('../../../services/api', () => ({
  api: {
    getUserPets: mockGetUserPets,
    updatePet: mockUpdatePet,
  },
}));

// Mock useAIBio domain hook
const mockGenerateAIBio = jest.fn();
const mockAddToHistory = jest.fn();
const mockClearHistory = jest.fn();

const mockLastGeneratedBio = {
  bio: 'Meet Buddy! A friendly dog.',
  keywords: ['friendly', 'playful'],
  sentiment: { score: 0.9, label: 'positive' },
  matchScore: 88,
};

jest.mock('../../domains/ai/useAIBio', () => ({
  useAIBio: () => ({
    generateBio: mockGenerateAIBio,
    isGenerating: false,
    lastGeneratedBio: mockLastGeneratedBio,
    bioHistory: [],
    addToHistory: mockAddToHistory,
    clearHistory: mockClearHistory,
  }),
}));

describe('useAIBioScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserPets.mockResolvedValue([{ _id: 'pet1', name: 'Buddy' }]);
    mockUpdatePet.mockResolvedValue({ success: true });
  });

  it('should initialize with default form state', () => {
    const { result } = renderHook(() => useAIBioScreen());

    expect(result.current.petName).toBe('');
    expect(result.current.petBreed).toBe('');
    expect(result.current.petAge).toBe('');
    expect(result.current.petPersonality).toBe('');
    expect(result.current.selectedTone).toBe('playful');
    expect(result.current.selectedPhoto).toBe(null);
  });

  it('should provide available tones', () => {
    const { result } = renderHook(() => useAIBioScreen());

    expect(result.current.tones).toHaveLength(5);
    expect(result.current.tones[0].id).toBe('playful');
    expect(result.current.tones[1].id).toBe('professional');
    expect(result.current.tones[2].id).toBe('casual');
    expect(result.current.tones[3].id).toBe('romantic');
    expect(result.current.tones[4].id).toBe('funny');
  });

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
      result.current.setPetAge('3');
    });

    expect(result.current.petAge).toBe('3');
  });

  it('should update pet personality', () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetPersonality('friendly, playful');
    });

    expect(result.current.petPersonality).toBe('friendly, playful');
  });

  it('should update selected tone', () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setSelectedTone('professional');
    });

    expect(result.current.selectedTone).toBe('professional');
  });

  it('should request image picker permissions', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.jpg' }],
    });

    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(result.current.selectedPhoto).toBe('file://test.jpg');
  });

  it('should show alert when permissions denied', async () => {
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
    expect(result.current.selectedPhoto).toBe(null);
  });

  it('should handle canceled image picker', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.pickImage();
    });

    expect(result.current.selectedPhoto).toBe(null);
  });

  it('should require pet name for bio generation', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.generateBio();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Missing Information', "Please enter your pet's name");
    expect(mockGenerateAIBio).not.toHaveBeenCalled();
  });

  it('should generate bio with form data', async () => {
    mockGenerateAIBio.mockResolvedValue(mockLastGeneratedBio);

    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetBreed('Golden Retriever');
      result.current.setPetAge('3');
      result.current.setPetPersonality('friendly, playful');
      result.current.setSelectedTone('playful');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(mockGenerateAIBio).toHaveBeenCalledWith({
      petName: 'Buddy',
      keywords: ['friendly', 'playful'],
      tone: 'playful',
      length: 'medium',
      petType: 'dog',
      age: 3,
      breed: 'Golden Retriever',
    });
  });

  it('should parse age as integer', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetName('Max');
      result.current.setPetAge('5');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(mockGenerateAIBio).toHaveBeenCalledWith(expect.objectContaining({ age: 5 }));
  });

  it('should handle invalid age', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetName('Max');
      result.current.setPetAge('invalid');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(mockGenerateAIBio).toHaveBeenCalledWith(
      expect.objectContaining({ age: 1 }), // Default to 1
    );
  });

  it('should save bio to pet profile', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.saveBio();
    });

    expect(mockGetUserPets).toHaveBeenCalled();
    expect(mockUpdatePet).toHaveBeenCalledWith('pet1', {
      description: mockLastGeneratedBio.bio,
    });
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Pet profile updated successfully!');
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should handle save when no pets exist', async () => {
    mockGetUserPets.mockResolvedValue([]);

    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.saveBio();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Saved Locally', 'Bio has been saved to your device');
  });

  it('should handle save errors gracefully', async () => {
    mockGetUserPets.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useAIBioScreen());

    await act(async () => {
      await result.current.saveBio();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Saved Locally', 'Bio has been saved to your device');
  });

  it('should navigate back', () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.handleGoBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should clear form', () => {
    const { result } = renderHook(() => useAIBioScreen());

    // Set some values
    act(() => {
      result.current.setPetName('Max');
      result.current.setPetBreed('Labrador');
      result.current.setPetAge('2');
      result.current.setPetPersonality('energetic');
      result.current.setSelectedTone('funny');
      result.current.setSelectedPhoto('photo.jpg');
    });

    // Clear form
    act(() => {
      result.current.clearForm();
    });

    expect(result.current.petName).toBe('');
    expect(result.current.petBreed).toBe('');
    expect(result.current.petAge).toBe('');
    expect(result.current.petPersonality).toBe('');
    expect(result.current.selectedTone).toBe('playful');
    expect(result.current.selectedPhoto).toBe(null);
    expect(mockClearHistory).toHaveBeenCalled();
  });

  it('should provide generated bio from domain hook', () => {
    const { result } = renderHook(() => useAIBioScreen());

    expect(result.current.generatedBio).toEqual(mockLastGeneratedBio);
  });

  it('should provide isGenerating state', () => {
    const { result } = renderHook(() => useAIBioScreen());

    expect(result.current.isGenerating).toBe(false);
  });

  it('should provide bio history', () => {
    const { result } = renderHook(() => useAIBioScreen());

    expect(result.current.bioHistory).toEqual([]);
  });

  it('should split personality keywords correctly', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetPersonality('  friendly,  playful,  energetic  ');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(mockGenerateAIBio).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: ['friendly', 'playful', 'energetic'],
      }),
    );
  });

  it('should filter empty keywords', async () => {
    const { result } = renderHook(() => useAIBioScreen());

    act(() => {
      result.current.setPetName('Buddy');
      result.current.setPetPersonality('friendly,  ,  , playful');
    });

    await act(async () => {
      await result.current.generateBio();
    });

    expect(mockGenerateAIBio).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: ['friendly', 'playful'],
      }),
    );
  });
});
