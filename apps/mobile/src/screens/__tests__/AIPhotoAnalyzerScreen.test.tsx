import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAuthStore } from '@pawfectmatch/core';
import AIPhotoAnalyzerScreen from '../AIPhotoAnalyzerScreen';
import { api } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../services/api', () => ({
  api: {
    ai: {
      analyzePhotos: jest.fn(),
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
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

describe('AIPhotoAnalyzerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  const renderComponent = () => {
    return render(<AIPhotoAnalyzerScreen navigation={mockNavigation} />);
  };

  describe('Rendering', () => {
    it('renders correctly with initial state', () => {
      const { getByText, getByTestId } = renderComponent();

      expect(getByText('AI Photo Analyzer')).toBeTruthy();
      expect(getByText('📷 Select Pet Photos')).toBeTruthy();
      expect(getByText('Take Photo')).toBeTruthy();
      expect(getByText('From Gallery')).toBeTruthy();
      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('shows photo selection instructions', () => {
      const { getByText } = renderComponent();

      expect(getByText(/Upload up to 5 photos of your pet for AI analysis/)).toBeTruthy();
      expect(getByText(/Include clear, well-lit photos for best results/)).toBeTruthy();
    });
  });

  describe('Photo Selection', () => {
    it('requests camera permissions when taking photo', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'camera-photo-uri' }],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('Take Photo'));
      });

      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('requests media library permissions when selecting from gallery', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'gallery-photo-uri' }],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    });

    it('shows permission alert when camera permission is denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('Take Photo'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        'We need access to your camera to take pet photos.',
        [{ text: 'OK' }]
      );
    });

    it('shows permission alert when media library permission is denied', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        'We need access to your photo library to analyze pet photos.',
        [{ text: 'OK' }]
      );
    });

    it('adds selected photos to the list', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'photo1-uri' },
          { uri: 'photo2-uri' },
        ],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Should show analyze button after photos are selected
      await waitFor(() => {
        expect(getByText('Analyze Photos')).toBeTruthy();
      });
    });

    it('limits photos to maximum of 5', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'photo1-uri' },
          { uri: 'photo2-uri' },
          { uri: 'photo3-uri' },
          { uri: 'photo4-uri' },
          { uri: 'photo5-uri' },
          { uri: 'photo6-uri' }, // This should be ignored
        ],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Should still show "Add Photo" button since we're at the limit
      await waitFor(() => {
        expect(getByText('Add Photo')).toBeTruthy();
      });
    });

    it('removes photo when remove button is pressed', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText, getByTestId } = renderComponent();

      // Add a photo first
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Remove the photo
      await act(async () => {
        fireEvent.press(getByTestId('remove-photo-0'));
      });

      // Should show "Add Photo" button again
      await waitFor(() => {
        expect(getByText('Add Photo')).toBeTruthy();
      });
    });
  });

  describe('Photo Analysis', () => {
    it('shows error when no photos are selected for analysis', async () => {
      const { getByText } = renderComponent();

      // Try to analyze without selecting photos
      const analyzeButton = getByText('Analyze Photos');
      fireEvent.press(analyzeButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'No Photos',
          'Please select at least one photo to analyze.'
        );
      });
    });

    it('calls API with correct parameters when analyzing photos', async () => {
      const mockAnalyzePhotos = jest.fn().mockResolvedValue({
        breed_analysis: {
          primary_breed: 'Golden Retriever',
          confidence: 0.95,
        },
        health_assessment: {
          age_estimate: 3,
          health_score: 0.9,
          recommendations: ['Regular exercise recommended'],
        },
        photo_quality: {
          overall_score: 0.85,
          lighting_score: 0.9,
          composition_score: 0.8,
          clarity_score: 0.85,
        },
        matchability_score: 0.88,
        ai_insights: ['High quality photo', 'Good lighting'],
      });

      (api.ai.analyzePhotos as jest.Mock).mockImplementation(mockAnalyzePhotos);

      // Mock photo selection
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      // Add a photo first
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Analyze the photo
      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(mockAnalyzePhotos).toHaveBeenCalledWith(['photo1-uri']);
      });
    });

    it('displays analysis results when API call succeeds', async () => {
      const mockAnalysisResult = {
        breed_analysis: {
          primary_breed: 'Golden Retriever',
          confidence: 0.95,
          secondary_breeds: [
            { breed: 'Labrador', confidence: 0.3 },
          ],
        },
        health_assessment: {
          age_estimate: 3,
          health_score: 0.9,
          recommendations: ['Regular exercise recommended', 'Annual vet checkup'],
        },
        photo_quality: {
          overall_score: 0.85,
          lighting_score: 0.9,
          composition_score: 0.8,
          clarity_score: 0.85,
        },
        matchability_score: 0.88,
        ai_insights: ['High quality photo', 'Good lighting', 'Clear subject'],
      };

      (api.ai.analyzePhotos as jest.Mock).mockResolvedValue(mockAnalysisResult);

      // Mock photo selection
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      // Add a photo first
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Analyze the photo
      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(getByText('🎯 Analysis Results')).toBeTruthy();
        expect(getByText('Golden Retriever')).toBeTruthy();
        expect(getByText('95% confidence')).toBeTruthy();
        expect(getByText('3 years')).toBeTruthy();
        expect(getByText('90/100')).toBeTruthy();
      });
    });

    it('shows loading state during analysis', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (api.ai.analyzePhotos as jest.Mock).mockReturnValue(promise);

      // Mock photo selection
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      // Add a photo first
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Start analysis
      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      // Should show loading state
      expect(getByText('Analyzing...')).toBeTruthy();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          breed_analysis: { primary_breed: 'Test', confidence: 0.8 },
          health_assessment: { age_estimate: 2, health_score: 0.8, recommendations: [] },
          photo_quality: { overall_score: 0.8, lighting_score: 0.8, composition_score: 0.8, clarity_score: 0.8 },
          matchability_score: 0.8,
          ai_insights: [],
        });
      });
    });

    it('shows error message when API call fails', async () => {
      const mockError = new Error('Analysis failed');
      (api.ai.analyzePhotos as jest.Mock).mockRejectedValue(mockError);

      // Mock photo selection
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      // Add a photo first
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      // Try to analyze
      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(getByText('Analysis failed')).toBeTruthy();
      });
    });
  });

  describe('Results Display', () => {
    it('shows matchability score with correct color coding', async () => {
      const mockAnalysisResult = {
        breed_analysis: { primary_breed: 'Test', confidence: 0.8 },
        health_assessment: { age_estimate: 2, health_score: 0.8, recommendations: [] },
        photo_quality: { overall_score: 0.8, lighting_score: 0.8, composition_score: 0.8, clarity_score: 0.8 },
        matchability_score: 0.85, // High score
        ai_insights: [],
      };

      (api.ai.analyzePhotos as jest.Mock).mockResolvedValue(mockAnalysisResult);

      // Mock photo selection and analysis
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(getByText('85/100')).toBeTruthy();
        expect(getByText('Excellent for matching!')).toBeTruthy();
      });
    });

    it('displays secondary breeds when available', async () => {
      const mockAnalysisResult = {
        breed_analysis: {
          primary_breed: 'Golden Retriever',
          confidence: 0.7,
          secondary_breeds: [
            { breed: 'Labrador', confidence: 0.3 },
            { breed: 'Poodle', confidence: 0.2 },
          ],
        },
        health_assessment: { age_estimate: 2, health_score: 0.8, recommendations: [] },
        photo_quality: { overall_score: 0.8, lighting_score: 0.8, composition_score: 0.8, clarity_score: 0.8 },
        matchability_score: 0.8,
        ai_insights: [],
      };

      (api.ai.analyzePhotos as jest.Mock).mockResolvedValue(mockAnalysisResult);

      // Mock photo selection and analysis
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(getByText('Possible Mixed Breeds:')).toBeTruthy();
        expect(getByText('Labrador')).toBeTruthy();
        expect(getByText('Poodle')).toBeTruthy();
        expect(getByText('30%')).toBeTruthy();
        expect(getByText('20%')).toBeTruthy();
      });
    });

    it('shows AI insights when available', async () => {
      const mockAnalysisResult = {
        breed_analysis: { primary_breed: 'Test', confidence: 0.8 },
        health_assessment: { age_estimate: 2, health_score: 0.8, recommendations: [] },
        photo_quality: { overall_score: 0.8, lighting_score: 0.8, composition_score: 0.8, clarity_score: 0.8 },
        matchability_score: 0.8,
        ai_insights: [
          'High quality photo with good lighting',
          'Clear subject focus',
          'Professional composition',
        ],
      };

      (api.ai.analyzePhotos as jest.Mock).mockResolvedValue(mockAnalysisResult);

      // Mock photo selection and analysis
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      await waitFor(() => {
        expect(getByText('🤖 AI Insights')).toBeTruthy();
        expect(getByText('• High quality photo with good lighting')).toBeTruthy();
        expect(getByText('• Clear subject focus')).toBeTruthy();
        expect(getByText('• Professional composition')).toBeTruthy();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets analysis when new analysis button is pressed', async () => {
      const mockAnalysisResult = {
        breed_analysis: { primary_breed: 'Test', confidence: 0.8 },
        health_assessment: { age_estimate: 2, health_score: 0.8, recommendations: [] },
        photo_quality: { overall_score: 0.8, lighting_score: 0.8, composition_score: 0.8, clarity_score: 0.8 },
        matchability_score: 0.8,
        ai_insights: [],
      };

      (api.ai.analyzePhotos as jest.Mock).mockResolvedValue(mockAnalysisResult);

      // Mock photo selection and analysis
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'photo1-uri' }],
      });

      const { getByText } = renderComponent();

      // Add photo and analyze
      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      await act(async () => {
        fireEvent.press(getByText('Analyze Photos'));
      });

      // Wait for results to show
      await waitFor(() => {
        expect(getByText('🎯 Analysis Results')).toBeTruthy();
      });

      // Reset analysis
      await act(async () => {
        fireEvent.press(getByText('New Analysis'));
      });

      // Should be back to photo selection
      await waitFor(() => {
        expect(getByText('📷 Select Pet Photos')).toBeTruthy();
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

  describe('Error Handling', () => {
    it('handles image picker errors gracefully', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(
        new Error('Image picker error')
      );

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('From Gallery'));
      });

      await waitFor(() => {
        expect(getByText('Failed to select images. Please try again.')).toBeTruthy();
      });
    });

    it('handles camera errors gracefully', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(
        new Error('Camera error')
      );

      const { getByText } = renderComponent();

      await act(async () => {
        fireEvent.press(getByText('Take Photo'));
      });

      await waitFor(() => {
        expect(getByText('Failed to take photo. Please try again.')).toBeTruthy();
      });
    });
  });
});
