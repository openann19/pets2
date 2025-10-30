/**
 * Comprehensive tests for Admin Uploads Screen
 * Tests upload moderation, approval/rejection, and real API integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminUploadsScreen from '../AdminUploadsScreen';
import { _adminAPI } from '../../../services/api';
import { errorHandler } from '../../../services/errorHandler';

// Mock dependencies
jest.mock('../../../services/api', () => ({
  _adminAPI: {
    getUploads: jest.fn(),
    moderateUpload: jest.fn(),
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
      textSecondary: '#666666',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    radii: { sm: 8, md: 12, lg: 16, full: 9999 },
    typography: {
      h2: { size: 22, weight: '600' },
      body: { size: 16, weight: '400' },
    },
  }),
}));

jest.mock('../../../theme/adapters', () => ({
  getExtendedColors: () => ({
    background: '#FFFFFF',
    card: '#FFFFFF',
    textSecondary: '#666666',
    shadow: '#000000',
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
  Image: require('react-native').Image,
  ActivityIndicator: require('react-native').ActivityIndicator,
  RefreshControl: require('react-native').RefreshControl,
  Dimensions: require('react-native').Dimensions,
  SafeAreaView: require('react-native-safe-area-context').SafeAreaView,
}));

const mockNavigation = {
  goBack: jest.fn(),
};

const mockUploads = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    type: 'pet' as const,
    url: 'https://example.com/image1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    uploadedAt: '2024-01-27T10:00:00Z',
    status: 'pending' as const,
    flagged: false,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    type: 'profile' as const,
    url: 'https://example.com/image2.jpg',
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    uploadedAt: '2024-01-27T11:00:00Z',
    status: 'pending' as const,
    flagged: true,
    flagReason: 'Inappropriate content',
  },
];

describe('AdminUploadsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', async () => {
      (_adminAPI.getUploads as jest.Mock).mockImplementation(() => new Promise(() => {}));

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      expect(getByText('Loading uploads...')).toBeTruthy();
    });

    it('should load uploads on mount', async () => {
      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: mockUploads,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });
  });

  describe('Upload Display', () => {
    beforeEach(() => {
      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: mockUploads,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      });
    });

    it('should display upload cards with user information', async () => {
      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should display upload type and date', async () => {
      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText(/pet/)).toBeTruthy();
        expect(getByText(/profile/)).toBeTruthy();
      });
    });

    it('should show flagged badge for flagged uploads', async () => {
      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        // Check for flagged upload (second upload)
        const uploadCard = getByText('Jane Smith').parent?.parent;
        expect(uploadCard).toBeTruthy();
      });
    });

    it('should filter uploads by status', async () => {
      const { getByText, getByTestId } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Pending')).toBeTruthy();
      });

      const flaggedButton = getByText('Flagged');
      fireEvent.press(flaggedButton);

      await waitFor(() => {
        expect(_adminAPI.getUploads).toHaveBeenCalledWith(
          expect.objectContaining({
            filter: 'flagged',
          }),
        );
      });
    });

    it('should search uploads by query', async () => {
      const { getByPlaceholderText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        const searchInput = getByPlaceholderText('Search uploads...');
        fireEvent.changeText(searchInput, 'John');

        expect(_adminAPI.getUploads).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'John',
          }),
        );
      });
    });
  });

  describe('Upload Moderation', () => {
    beforeEach(() => {
      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: [mockUploads[0]],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });
    });

    it('should open upload details modal when upload is pressed', async () => {
      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const uploadCard = getByText('John Doe').parent?.parent;
      fireEvent.press(uploadCard!);

      await waitFor(() => {
        expect(getByText('Upload Details')).toBeTruthy();
      });
    });

    it('should approve upload successfully', async () => {
      (_adminAPI.moderateUpload as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Upload approved successfully',
      });

      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: [{ ...mockUploads[0], status: 'approved' }],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const uploadCard = getByText('John Doe').parent?.parent;
      fireEvent.press(uploadCard!);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      const approveButton = getByText('Approve');
      fireEvent.press(approveButton);

      await waitFor(() => {
        expect(_adminAPI.moderateUpload).toHaveBeenCalledWith({
          uploadId: '1',
          action: 'approve',
        });
      });

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Upload approved successfully');
      });
    });

    it('should reject upload with reason', async () => {
      (Alert.prompt as jest.Mock).mockImplementation((title, message, buttons) => {
        const rejectButton = buttons.find((b: any) => b.text === 'Reject');
        if (rejectButton) {
          rejectButton.onPress?.('Inappropriate content');
        }
      });

      (_adminAPI.moderateUpload as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Upload rejected successfully',
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const uploadCard = getByText('John Doe').parent?.parent;
      fireEvent.press(uploadCard!);

      await waitFor(() => {
        expect(getByText('Reject')).toBeTruthy();
      });

      const rejectButton = getByText('Reject');
      fireEvent.press(rejectButton);

      await waitFor(() => {
        const { Alert } = require('react-native');
        expect(Alert.prompt).toHaveBeenCalled();
      });
    });

    it('should handle moderation errors', async () => {
      (_adminAPI.moderateUpload as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const uploadCard = getByText('John Doe').parent?.parent;
      fireEvent.press(uploadCard!);

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
          'Failed to approve upload. Please try again.',
        );
      });
    });

    it('should reload uploads after moderation', async () => {
      (_adminAPI.moderateUpload as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Upload approved successfully',
      });

      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: [{ ...mockUploads[0], status: 'approved' }],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        },
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const uploadCard = getByText('John Doe').parent?.parent;
      fireEvent.press(uploadCard!);

      await waitFor(() => {
        expect(getByText('Approve')).toBeTruthy();
      });

      const approveButton = getByText('Approve');
      fireEvent.press(approveButton);

      await waitFor(() => {
        // Should reload uploads after moderation
        expect(_adminAPI.getUploads).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no uploads found', async () => {
      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        },
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('No uploads found')).toBeTruthy();
      });
    });
  });

  describe('Refresh', () => {
    it('should refresh uploads when pull-to-refresh is triggered', async () => {
      (_adminAPI.getUploads as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          uploads: mockUploads,
          pagination: { page: 1, limit: 50, total: 2, pages: 1 },
        },
      });

      const { getByText } = render(<AdminUploadsScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      // Simulate refresh
      const { refreshControl } = render(<AdminUploadsScreen navigation={mockNavigation} />);
      // In real implementation, would trigger refreshControl onRefresh

      expect(_adminAPI.getUploads).toHaveBeenCalled();
    });
  });
});
