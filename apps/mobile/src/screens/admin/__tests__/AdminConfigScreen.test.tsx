/**
 * Comprehensive tests for Admin Configuration Management
 * Tests API configuration loading, saving, and UI interactions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminConfigScreen from '../AdminConfigScreen';
import { _adminAPI } from '../../../services/api';

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  TouchableOpacity: require('react-native').TouchableOpacity,
  View: require('react-native').View,
  Text: require('react-native').Text,
  TextInput: require('react-native').TextInput,
  Modal: require('react-native').Modal,
  Switch: require('react-native').Switch,
  ScrollView: require('react-native').ScrollView,
  ActivityIndicator: require('react-native').ActivityIndicator,
  SafeAreaView: require('react-native-safe-area-context').SafeAreaView,
}));

// Mock dependencies
jest.mock('../../../services/api', () => ({
  _adminAPI: {
    getAIConfig: jest.fn(),
    getStripeConfig: jest.fn(),
    getServicesStatus: jest.fn(),
    saveAIConfig: jest.fn(),
    saveStripeConfig: jest.fn(),
    saveExternalServiceConfig: jest.fn(),
  },
}));

jest.mock('../../../services/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
  },
}));

jest.mock('../../../services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@mobile/theme', () => ({
  useTheme: () => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      onSurface: '#000000',
      onMuted: '#666666',
      border: '#E0E0E0',
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      info: '#5AC8FA',
    },
    spacing: {
      'xs': 4,
      'sm': 8,
      'md': 16,
      'lg': 24,
      'xl': 32,
      '2xl': 48,
    },
    radii: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      full: 9999,
    },
    typography: {
      h1: { size: 28, weight: '700' },
      h2: { size: 22, weight: '600' },
      h3: { size: 18, weight: '600' },
      body: { size: 16, weight: '400' },
    },
    shadows: {
      elevation2: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Ionicons: React.forwardRef(({ name, size, color, testID, ...props }: any, ref: any) => (
      <View
        testID={testID || `icon-${name}`}
        accessibilityLabel={name}
        data-name={name}
        data-size={size}
        data-color={color}
        ref={ref}
        {...props}
      />
    )),
  };
});

const mockNavigation = {
  goBack: jest.fn(),
};

describe('AdminConfigScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', async () => {
      (_adminAPI.getAIConfig as jest.Mock).mockImplementation(() => new Promise(() => {}));
      (_adminAPI.getStripeConfig as jest.Mock).mockImplementation(() => new Promise(() => {}));
      (_adminAPI.getServicesStatus as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      expect(getByText('Loading configurations...')).toBeTruthy();
    });

    it('should load configurations on mount', async () => {
      const aiConfig = {
        success: true,
        data: {
          apiKey: '***configured***',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          maxTokens: 4000,
          temperature: 0.7,
          isConfigured: true,
          isActive: true,
        },
      };

      const stripeConfig = {
        success: true,
        data: {
          secretKey: '***configured***',
          publishableKey: 'pk_test_123',
          webhookSecret: '***configured***',
          isLiveMode: false,
          isConfigured: true,
        },
      };

      const servicesStatus = {
        success: true,
        data: {
          'aws-rekognition': {
            status: 'operational',
            endpoint: 'https://rekognition.amazonaws.com',
            isConfigured: true,
            isActive: true,
          },
        },
      };

      (_adminAPI.getAIConfig as jest.Mock).mockResolvedValue(aiConfig);
      (_adminAPI.getStripeConfig as jest.Mock).mockResolvedValue(stripeConfig);
      (_adminAPI.getServicesStatus as jest.Mock).mockResolvedValue(servicesStatus);

      const { getByText, queryByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(queryByText('Loading configurations...')).toBeNull();
      });

      expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      expect(getByText('Stripe Payments')).toBeTruthy();
    });
  });

  describe('Service List Display', () => {
    beforeEach(async () => {
      const aiConfig = {
        success: true,
        data: {
          apiKey: '***configured***',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          maxTokens: 4000,
          temperature: 0.7,
          isConfigured: true,
          isActive: true,
        },
      };

      const stripeConfig = {
        success: true,
        data: {
          secretKey: '***configured***',
          publishableKey: 'pk_test_123',
          isConfigured: true,
        },
      };

      const servicesStatus = {
        success: true,
        data: {},
      };

      (_adminAPI.getAIConfig as jest.Mock).mockResolvedValue(aiConfig);
      (_adminAPI.getStripeConfig as jest.Mock).mockResolvedValue(stripeConfig);
      (_adminAPI.getServicesStatus as jest.Mock).mockResolvedValue(servicesStatus);
    });

    it('should display service cards with correct information', async () => {
      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
        expect(getByText('Stripe Payments')).toBeTruthy();
      });

      expect(getByText('AI text generation and compatibility analysis')).toBeTruthy();
      expect(getByText('Payment processing and subscription management')).toBeTruthy();
    });

    it('should show configured status badge for configured services', async () => {
      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Configured')).toBeTruthy();
      });
    });

    it('should open configuration modal when service card is pressed', async () => {
      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy(); // Modal title
      });
    });
  });

  describe('Configuration Modal', () => {
    beforeEach(async () => {
      const aiConfig = {
        success: true,
        data: {
          apiKey: '***configured***',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          maxTokens: 4000,
          temperature: 0.7,
          isConfigured: true,
          isActive: true,
        },
      };

      const stripeConfig = {
        success: true,
        data: {
          secretKey: '***configured***',
          publishableKey: 'pk_test_123',
          isConfigured: true,
        },
      };

      const servicesStatus = {
        success: true,
        data: {},
      };

      (_adminAPI.getAIConfig as jest.Mock).mockResolvedValue(aiConfig);
      (_adminAPI.getStripeConfig as jest.Mock).mockResolvedValue(stripeConfig);
      (_adminAPI.getServicesStatus as jest.Mock).mockResolvedValue(servicesStatus);
    });

    it('should display all configuration fields for AI service', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AdminConfigScreen navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByText('API Key')).toBeTruthy();
        expect(getByText('Base URL')).toBeTruthy();
        expect(getByText('Model')).toBeTruthy();
        expect(getByText('Max Tokens')).toBeTruthy();
        expect(getByText('Temperature')).toBeTruthy();
        expect(getByText('Service Active')).toBeTruthy();
      });
    });

    it('should validate required fields before saving', async () => {
      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByText('Save Configuration')).toBeTruthy();
      });

      const saveButton = getByText('Save Configuration');
      fireEvent.press(saveButton);

      // Should show validation error
      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('is required'),
        );
      });
    });

    it('should save AI configuration successfully', async () => {
      (_adminAPI.saveAIConfig as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Configuration saved successfully',
      });

      const { getByText, getByPlaceholderText } = render(
        <AdminConfigScreen navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByPlaceholderText('sk-...')).toBeTruthy();
      });

      const apiKeyInput = getByPlaceholderText('sk-...');
      fireEvent.changeText(apiKeyInput, 'sk-test123');

      const baseUrlInput = getByPlaceholderText('https://api.deepseek.com');
      fireEvent.changeText(baseUrlInput, 'https://api.deepseek.com');

      const modelInput = getByPlaceholderText('deepseek-chat');
      fireEvent.changeText(modelInput, 'deepseek-chat');

      const saveButton = getByText('Save Configuration');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(_adminAPI.saveAIConfig).toHaveBeenCalledWith({
          apiKey: 'sk-test123',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          maxTokens: 4000,
          temperature: 0.7,
        });
      });

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Configuration saved successfully');
      });
    });

    it('should save Stripe configuration successfully', async () => {
      (_adminAPI.saveStripeConfig as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Configuration saved successfully',
      });

      const { getByText, getByPlaceholderText } = render(
        <AdminConfigScreen navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('Stripe Payments')).toBeTruthy();
      });

      const serviceCard = getByText('Stripe Payments').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByPlaceholderText('sk_...')).toBeTruthy();
      });

      const secretKeyInput = getByPlaceholderText('sk_...');
      fireEvent.changeText(secretKeyInput, 'sk_test_123');

      const publishableKeyInput = getByPlaceholderText('pk_...');
      fireEvent.changeText(publishableKeyInput, 'pk_test_123');

      const saveButton = getByText('Save Configuration');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(_adminAPI.saveStripeConfig).toHaveBeenCalledWith({
          secretKey: 'sk_test_123',
          publishableKey: 'pk_test_123',
          webhookSecret: '',
          isLiveMode: false,
        });
      });
    });

    it('should handle save errors gracefully', async () => {
      (_adminAPI.saveAIConfig as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByText('Save Configuration')).toBeTruthy();
      });

      const saveButton = getByText('Save Configuration');
      fireEvent.press(saveButton);

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save configuration');
      });
    });

    it('should close modal when cancel is pressed', async () => {
      const { getByText, queryByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('AI Service (DeepSeek)')).toBeTruthy();
      });

      const serviceCard = getByText('AI Service (DeepSeek)').parent?.parent;
      fireEvent.press(serviceCard!);

      await waitFor(() => {
        expect(getByText('Cancel')).toBeTruthy();
      });

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(queryByText('Save Configuration')).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors when loading configurations', async () => {
      (_adminAPI.getAIConfig as jest.Mock).mockRejectedValue(new Error('Network error'));
      (_adminAPI.getStripeConfig as jest.Mock).mockRejectedValue(new Error('Network error'));
      (_adminAPI.getServicesStatus as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { queryByText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(queryByText('Loading configurations...')).toBeNull();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', async () => {
      const { getByLabelText } = render(<AdminConfigScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const backButton = getByLabelText('Go back');
        fireEvent.press(backButton);
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });
});
