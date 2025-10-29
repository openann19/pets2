import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAuthStore } from '@pawfectmatch/core';
import AIBioScreen from '../AIBioScreen';
import { api } from '../../services/api';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../services/api', () => ({
  api: {
    ai: {
      generateBio: jest.fn(),
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock user data
const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
};

describe('AIBioScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  const renderComponent = () => {
    return render(<AIBioScreen navigation={mockNavigation} />);
  };

  describe('Rendering', () => {
    it('renders all input fields correctly', () => {
      const { getByPlaceholderText, getByText } = renderComponent();

      expect(getByPlaceholderText('Enter pet name')).toBeTruthy();
      expect(getByPlaceholderText('Enter pet breed')).toBeTruthy();
      expect(getByPlaceholderText('Enter pet age')).toBeTruthy();
      expect(getByPlaceholderText('Enter personality traits (comma-separated)')).toBeTruthy();
      expect(getByText('Generate AI Bio')).toBeTruthy();
    });

    it('displays the header with correct title', () => {
      const { getByText } = renderComponent();
      expect(getByText('AI Bio Generator')).toBeTruthy();
    });

    it('shows back button', () => {
      const { getByTestId } = renderComponent();
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error when pet name is empty', async () => {
      const { getByText, getByPlaceholderText } = renderComponent();

      const generateButton = getByText('Generate AI Bio');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          "Please enter your pet's name.",
        );
      });
    });

    it('shows error when pet breed is empty', async () => {
      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in pet name but leave breed empty
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');

      const generateButton = getByText('Generate AI Bio');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          "Please enter your pet's breed.",
        );
      });
    });

    it('shows error when pet age is empty', async () => {
      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in name and breed but leave age empty
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');

      const generateButton = getByText('Generate AI Bio');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          "Please enter your pet's age.",
        );
      });
    });

    it('shows error when personality traits are empty', async () => {
      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all fields except personality
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');

      const generateButton = getByText('Generate AI Bio');
      fireEvent.press(generateButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          'Please enter personality traits.',
        );
      });
    });
  });

  describe('API Integration', () => {
    it('calls API with correct parameters when form is valid', async () => {
      const mockGenerateBio = jest.fn().mockResolvedValue({
        bio: 'Buddy is a friendly and energetic Golden Retriever who loves to play fetch.',
        keywords: ['friendly', 'energetic', 'playful'],
        sentiment: { score: 0.9, label: 'positive' },
        matchScore: 85,
      });

      (api.ai.generateBio as jest.Mock).mockImplementation(mockGenerateBio);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(mockGenerateBio).toHaveBeenCalledWith({
          petName: 'Buddy',
          keywords: ['friendly', 'energetic', 'playful'],
          tone: 'playful',
          length: 'medium',
          petType: 'dog',
          age: 3,
          breed: 'Golden Retriever',
        });
      });
    });

    it('displays generated bio when API call succeeds', async () => {
      const mockBioData = {
        bio: 'Buddy is a friendly and energetic Golden Retriever who loves to play fetch.',
        keywords: ['friendly', 'energetic', 'playful'],
        sentiment: { score: 0.9, label: 'positive' },
        matchScore: 85,
      };

      (api.ai.generateBio as jest.Mock).mockResolvedValue(mockBioData);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(getByText('Generated Bio')).toBeTruthy();
        expect(getByText(mockBioData.bio)).toBeTruthy();
        expect(getByText('Match Score: 85%')).toBeTruthy();
      });
    });

    it('shows error message when API call fails', async () => {
      const mockError = new Error('API Error');
      (api.ai.generateBio as jest.Mock).mockRejectedValue(mockError);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Generation Failed',
          'Failed to generate bio. Please try again.',
        );
      });
    });

    it('shows loading state during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (api.ai.generateBio as jest.Mock).mockReturnValue(promise);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      // Should show loading state
      expect(getByText('Generating...')).toBeTruthy();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          bio: 'Generated bio',
          keywords: ['test'],
          sentiment: { score: 0.8, label: 'positive' },
          matchScore: 80,
        });
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is pressed', () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('back-button'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('User Experience', () => {
    it('trims whitespace from input values', async () => {
      const mockGenerateBio = jest.fn().mockResolvedValue({
        bio: 'Test bio',
        keywords: ['friendly'],
        sentiment: { score: 0.8, label: 'positive' },
        matchScore: 80,
      });

      (api.ai.generateBio as jest.Mock).mockImplementation(mockGenerateBio);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in fields with extra whitespace
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), '  Buddy  ');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), '  Golden Retriever  ');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '  3  ');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        '  friendly, energetic, playful  ',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(mockGenerateBio).toHaveBeenCalledWith({
          petName: 'Buddy',
          keywords: ['friendly', 'energetic', 'playful'],
          tone: 'playful',
          length: 'medium',
          petType: 'dog',
          age: 3,
          breed: 'Golden Retriever',
        });
      });
    });

    it('handles empty personality traits gracefully', async () => {
      const mockGenerateBio = jest.fn().mockResolvedValue({
        bio: 'Test bio',
        keywords: [],
        sentiment: { score: 0.8, label: 'positive' },
        matchScore: 80,
      });

      (api.ai.generateBio as jest.Mock).mockImplementation(mockGenerateBio);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in fields with empty personality after trimming
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        '   ,  ,  ',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          'Please enter personality traits.',
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network timeout gracefully', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      (api.ai.generateBio as jest.Mock).mockRejectedValue(timeoutError);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Generation Failed',
          'Failed to generate bio. Please try again.',
        );
      });
    });

    it('handles 503 service unavailable error', async () => {
      const serviceError = new Error('Service Unavailable');
      (serviceError as any).response = { status: 503 };

      (api.ai.generateBio as jest.Mock).mockRejectedValue(serviceError);

      const { getByText, getByPlaceholderText } = renderComponent();

      // Fill in all required fields
      fireEvent.changeText(getByPlaceholderText('Enter pet name'), 'Buddy');
      fireEvent.changeText(getByPlaceholderText('Enter pet breed'), 'Golden Retriever');
      fireEvent.changeText(getByPlaceholderText('Enter pet age'), '3');
      fireEvent.changeText(
        getByPlaceholderText('Enter personality traits (comma-separated)'),
        'friendly, energetic, playful',
      );

      const generateButton = getByText('Generate AI Bio');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Generation Failed',
          'Failed to generate bio. Please try again.',
        );
      });
    });
  });
});
