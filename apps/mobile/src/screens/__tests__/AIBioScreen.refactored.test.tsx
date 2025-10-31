/**
 * AIBioScreen Component Tests
 * Comprehensive test coverage for the refactored AI Bio Screen
 */

import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AIBioScreen from '../../screens/AIBioScreen';
import { useAIBioScreen } from '../../hooks/screens/useAIBioScreen';

// Mock all dependencies
jest.mock('../../hooks/screens/useAIBioScreen');
jest.mock('../../components/ai/PhotoUploadSection', () => ({
  PhotoUploadSection: ({ selectedPhoto, onPickImage }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return React.createElement(View, { testID: 'photo-upload-section' }, [
      React.createElement(Text, { key: 'title' }, 'Pet Photo (Optional)'),
      React.createElement(
        TouchableOpacity,
        {
          key: 'button',
          testID: 'photo-upload-button',
          onPress: onPickImage,
        },
        selectedPhoto ? 'Photo Selected' : 'Select Photo',
      ),
    ]);
  },
}));

jest.mock('../../components/ai/PetInfoForm', () => ({
  PetInfoForm: (props: any) => {
    const React = require('react');
    const { View, Text, TextInput } = require('react-native');
    return React.createElement(View, { testID: 'pet-info-form' }, [
      React.createElement(Text, { key: 'title' }, 'Pet Information'),
      React.createElement(TextInput, {
        key: 'name',
        testID: 'pet-name-input',
        value: props.petName,
        onChangeText: props.setPetName,
      }),
    ]);
  },
}));

jest.mock('../../components/ai/ToneSelector', () => ({
  ToneSelector: ({ onToneSelect, tones }: any) => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return React.createElement(View, { testID: 'tone-selector' }, [
      ...tones.map((tone: any, i: number) =>
        React.createElement(
          TouchableOpacity,
          {
            key: i,
            testID: `tone-${tone.id}`,
            onPress: () => onToneSelect(tone.id),
          },
          React.createElement(Text, null, tone.label),
        ),
      ),
    ]);
  },
}));

jest.mock('../../components/ai/GenerateButton', () => ({
  GenerateButton: ({ isGenerating, onPress }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(
      TouchableOpacity,
      {
        testID: 'generate-button',
        onPress,
        disabled: isGenerating,
      },
      React.createElement(Text, null, isGenerating ? 'Generating...' : 'Generate Bio'),
    );
  },
}));

jest.mock('../../components/ai/BioResults', () => ({
  BioResults: ({ generatedBio, onSave, onRegenerate }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return React.createElement(View, { testID: 'bio-results' }, [
      React.createElement(Text, { key: 'bio' }, generatedBio?.bio || ''),
      React.createElement(
        TouchableOpacity,
        {
          key: 'save',
          testID: 'save-bio-button',
          onPress: onSave,
        },
        React.createElement(Text, null, 'Save'),
      ),
      React.createElement(
        TouchableOpacity,
        {
          key: 'regenerate',
          testID: 'regenerate-bio-button',
          onPress: onRegenerate,
        },
        React.createElement(Text, null, 'Regenerate'),
      ),
    ]);
  },
}));

jest.mock('../../components/ai/BioHistorySection', () => ({
  BioHistorySection: ({ history }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    if (history.length <= 1) return null;
    return React.createElement(
      View,
      { testID: 'bio-history-section' },
      React.createElement(Text, null, 'Previous Versions'),
    );
  },
}));

jest.mock('@mobile/theme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F8F9FA',
      onSurface: '#000000',
      onMuted: '#666666',
      primary: '#007AFF',
      border: '#CCCCCC',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radii: { md: 8, lg: 12, full: 9999 },
    typography: {
      h2: { size: 20, weight: '700' },
      body: { size: 16 },
    },
  })),
}));

describe('AIBioScreen', () => {
  const mockUseAIBioScreen = {
    petName: '',
    setPetName: jest.fn(),
    petBreed: '',
    setPetBreed: jest.fn(),
    petAge: '',
    setPetAge: jest.fn(),
    petPersonality: '',
    setPetPersonality: jest.fn(),
    selectedTone: 'playful',
    setSelectedTone: jest.fn(),
    selectedPhoto: null,
    tones: [
      { id: 'playful', label: 'Playful', icon: '🎾', color: '#ff6b6b' },
      { id: 'professional', label: 'Professional', icon: '💼', color: '#4dabf7' },
    ],
    isGenerating: false,
    generatedBio: null,
    bioHistory: [],
    pickImage: jest.fn(),
    generateBio: jest.fn(),
    saveBio: jest.fn(),
    handleGoBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAIBioScreen as jest.Mock).mockReturnValue(mockUseAIBioScreen);
  });

  describe('Rendering', () => {
    it('should render all main sections', () => {
      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(getByText('AI Bio Generator')).toBeTruthy();
      expect(getByTestId('photo-upload-section')).toBeTruthy();
      expect(getByTestId('pet-info-form')).toBeTruthy();
      expect(getByTestId('tone-selector')).toBeTruthy();
      expect(getByTestId('generate-button')).toBeTruthy();
    });

    it('should render bio results when bio is generated', () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        generatedBio: mockBio,
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(getByTestId('bio-results')).toBeTruthy();
    });

    it('should render bio history when history has items', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        bioHistory: [
          { bio: 'First', matchScore: 80 },
          { bio: 'Second', matchScore: 85 },
        ],
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(getByTestId('bio-history-section')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call generateBio when generate button is pressed', () => {
      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const generateButton = getByTestId('generate-button');
      fireEvent.press(generateButton);

      expect(mockUseAIBioScreen.generateBio).toHaveBeenCalledTimes(1);
    });

    it('should call saveBio when save button is pressed', () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        generatedBio: mockBio,
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const saveButton = getByTestId('save-bio-button');
      fireEvent.press(saveButton);

      expect(mockUseAIBioScreen.saveBio).toHaveBeenCalledTimes(1);
    });

    it('should call generateBio when regenerate button is pressed', () => {
      const mockBio = { bio: 'Test bio', matchScore: 85 };
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        generatedBio: mockBio,
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const regenerateButton = getByTestId('regenerate-bio-button');
      fireEvent.press(regenerateButton);

      expect(mockUseAIBioScreen.generateBio).toHaveBeenCalledTimes(1);
    });

    it('should call handleGoBack when back button is pressed', () => {
      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const backButton = getByTestId('AIBioScreen-button-back');
      fireEvent.press(backButton);

      expect(mockUseAIBioScreen.handleGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Management', () => {
    it('should pass correct props to PetInfoForm', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        petName: 'Max',
        petBreed: 'Golden Retriever',
        petAge: '2',
        petPersonality: 'Playful',
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const nameInput = getByTestId('pet-name-input');
      expect(nameInput.props.value).toBe('Max');
    });

    it('should pass correct props to ToneSelector', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        selectedTone: 'professional',
      });

      const { getByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(getByTestId('tone-selector')).toBeTruthy();
    });

    it('should pass generating state to GenerateButton', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        isGenerating: true,
      });

      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      const generateButton = getByTestId('generate-button');
      expect(generateButton.props.disabled).toBe(true);
      expect(getByText('Generating...')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null generatedBio gracefully', () => {
      const { queryByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(queryByTestId('bio-results')).toBeNull();
    });

    it('should handle empty bio history', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        bioHistory: [],
      });

      const { queryByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(queryByTestId('bio-history-section')).toBeNull();
    });

    it('should handle single item bio history', () => {
      (useAIBioScreen as jest.Mock).mockReturnValue({
        ...mockUseAIBioScreen,
        bioHistory: [{ bio: 'Only bio', matchScore: 80 }],
      });

      const { queryByTestId } = render(
        <NavigationContainer>
          <AIBioScreen />
        </NavigationContainer>,
      );

      expect(queryByTestId('bio-history-section')).toBeNull();
    });
  });
});

