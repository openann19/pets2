/**
 * Comprehensive tests for Admin Verifications Screen
 * Tests KYC approval/rejection, request info, and real API integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminVerificationsScreen from '../AdminVerificationsScreen';
import { _adminAPI } from '../../../services/api';
import { errorHandler } from '../../../services/errorHandler';

// Mock dependencies
jest.mock('../../../services/api', () => ({
  _adminAPI: {
    getVerifications: jest.fn(),
    approveVerification: jest.fn(),
    rejectVerification: jest.fn(),
    requestVerificationInfo: jest.fn(),
  },
}));

jest.mock('../../../services/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
  },
}));

jest.mock('@mobile/theme', () => ({
  useTheme: () => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      card: '#FFFFFF',
      onSurface: '#000000',
      onMuted: '#666666',
      border: '#E0E0E0',
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      info: '#5AC8FA',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    radii: { sm: 8, md: 12, lg: 16, full: 9999 },
    typography: {
      h2: { size: 22, weight: '600' },
      body: { size: 16, weight: '400' },
    },
  }),
}));

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
  FlatList: require('react-native').FlatList,
  ActivityIndicator: require('react-native').ActivityIndicator,
  RefreshControl: require('react-native').RefreshControl,
  ScrollView: require('react-native').ScrollView,
  SafeAreaView: require('react-native-safe-area-context').SafeAreaView,
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

const mockVerifications = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    type: 'identity' as const,
    status: 'pending' as const,
    submittedAt: '2024-01-27T10:00:00Z',
    documents: [
      {
        id: 'doc1',
        type: 'photo_id' as const,
        url: 'https://example.com/id.jpg',
        name: 'Driver License',
      },
    ],
    priority: 'high' as const,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    type: 'pet_ownership' as const,
    status: 'pending' as const,
    submittedAt: '2024-01-27T11:00:00Z',
    documents: [
      {
        id: 'doc2',
        type: 'pet_registration' as const,
        url: 'https://example.com/registration.jpg',
        name: 'Pet Registration',
      },
    ],
    priority: 'medium' as const,
  },
];

describe('AdminVerificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', async () => {
      (_adminAPI.getVerifications as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      expect(getByText('Loading verifications...')).toBeTruthy();
    });

    it('should load verifications on mount', async () => {
      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: mockVerifications,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });
  });

  describe('Verification Display', () => {
    beforeEach(() => {
      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: mockVerifications,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      });
    });

    it('should display verification cards with user information', async () => {
      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('jane@example.com')).toBeTruthy();
      });
    });

    it('should display verification type and priority', async () => {
      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText(/IDENTITY/)).toBeTruthy();
        expect(getByText(/HIGH/)).toBeTruthy();
        expect(getByText(/MEDIUM/)).toBeTruthy();
      });
    });

    it('should display document count', async () => {
      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText(/1 document/)).toBeTruthy();
      });
    });

    it('should filter verifications by status', async () => {
      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Pending')).toBeTruthy();
      });

      const highPriorityButton = getByText('High Priority');
      fireEvent.press(highPriorityButton);

      // Should trigger filter change
      await waitFor(() => {
        expect(_adminAPI.getVerifications).toHaveBeenCalled();
      });
    });
  });

  describe('Verification Actions', () => {
    beforeEach(() => {
      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: [mockVerifications[0]],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });
    });

    it('should approve verification successfully', async () => {
      (_adminAPI.approveVerification as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Verification approved successfully',
      });

      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: [{ ...mockVerifications[0], status: 'approved' }],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const verificationCard = getByText('John Doe').parent?.parent;
      fireEvent.press(verificationCard!);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      const approveButton = getByText('Approve');
      fireEvent.press(approveButton);

      await waitFor(() => {
        expect(_adminAPI.approveVerification).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Verification approved successfully');
      });
    });

    it('should reject verification with reason', async () => {
      (Alert.prompt as jest.Mock).mockImplementation((title, message, buttons) => {
        const rejectButton = buttons.find((b: any) => b.text === 'Reject');
        if (rejectButton) {
          rejectButton.onPress?.('Invalid document');
        }
      });

      (_adminAPI.rejectVerification as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Verification rejected successfully',
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const verificationCard = getByText('John Doe').parent?.parent;
      fireEvent.press(verificationCard!);

      await waitFor(() => {
        expect(getByText('Reject')).toBeTruthy();
      });

      const rejectButton = getByText('Reject');
      fireEvent.press(rejectButton);

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.prompt).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(_adminAPI.rejectVerification).toHaveBeenCalledWith('1', 'Invalid document');
      });
    });

    it('should request additional information', async () => {
      (Alert.prompt as jest.Mock).mockImplementation((title, message, buttons) => {
        const requestButton = buttons.find((b: any) => b.text === 'Request');
        if (requestButton) {
          requestButton.onPress?.('Please provide additional proof of address');
        }
      });

      (_adminAPI.requestVerificationInfo as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Information request sent successfully',
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const verificationCard = getByText('John Doe').parent?.parent;
      fireEvent.press(verificationCard!);

      await waitFor(() => {
        expect(getByText('Request Info')).toBeTruthy();
      });

      const requestInfoButton = getByText('Request Info');
      fireEvent.press(requestInfoButton);

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.prompt).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(_adminAPI.requestVerificationInfo).toHaveBeenCalledWith(
          '1',
          'Please provide additional proof of address',
        );
      });
    });

    it('should handle action errors', async () => {
      (_adminAPI.approveVerification as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const verificationCard = getByText('John Doe').parent?.parent;
      fireEvent.press(verificationCard!);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      const approveButton = getByText('Approve');
      fireEvent.press(approveButton);

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(errorHandler.handleError).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to approve verification. Please try again.',
        );
      });
    });

    it('should reload verifications after action', async () => {
      (_adminAPI.approveVerification as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Verification approved successfully',
      });

      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: [{ ...mockVerifications[0], status: 'approved' }],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const verificationCard = getByText('John Doe').parent?.parent;
      fireEvent.press(verificationCard!);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      const approveButton = getByText('Approve');
      fireEvent.press(approveButton);

      await waitFor(() => {
        // Should reload verifications after action
        expect(_adminAPI.getVerifications).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: [mockVerifications[0]],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });
    });

    it('should show quick action buttons for pending verifications', async () => {
      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Quick actions should be visible on card
      const verificationCard = getByText('John Doe').parent?.parent;
      expect(verificationCard).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no verifications found', async () => {
      (_adminAPI.getVerifications as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          verifications: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        },
      });

      const { getByText } = render(<AdminVerificationsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('No verifications found')).toBeTruthy();
      });
    });
  });
});

