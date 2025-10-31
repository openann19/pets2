/**
 * ApplicationReviewScreen Comprehensive Integration Tests
 * Tests screen rendering, application loading, status updates, and all interactions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import ApplicationReviewScreen from '../ApplicationReviewScreen';
import { useApplicationReview } from '../review/hooks/useApplicationReview';

// Mock dependencies
jest.mock('../review/hooks/useApplicationReview', () => ({
  useApplicationReview: jest.fn(),
}));

jest.mock('../review/components', () => ({
  ApplicationHeader: ({ onBack }: any) => {
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onBack} testID="header-back">
        <Text>Application Header</Text>
      </TouchableOpacity>
    );
  },
  ApplicationStatusCard: ({ application }: any) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="status-card">
        <Text>{application?.status || 'No application'}</Text>
      </View>
    );
  },
  ContactInfoSection: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="contact-info">
        <Text>Contact Info</Text>
      </View>
    );
  },
  HomeLifestyleSection: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="home-lifestyle">
        <Text>Home Lifestyle</Text>
      </View>
    );
  },
  ExperienceSection: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="experience">
        <Text>Experience</Text>
      </View>
    );
  },
  QuestionsSection: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="questions">
        <Text>Questions</Text>
      </View>
    );
  },
  NotesSection: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="notes">
        <Text>Notes</Text>
      </View>
    );
  },
  StatusActions: ({ onStatusChange }: any) => {
    const { Text, TouchableOpacity, View } = require('react-native');
    return (
      <View testID="status-actions">
        <TouchableOpacity onPress={() => onStatusChange('approved')} testID="approve-btn">
          <Text>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onStatusChange('rejected')} testID="reject-btn">
          <Text>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  },
  ContactActions: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="contact-actions">
        <Text>Contact Actions</Text>
      </View>
    );
  },
  ApplicationLoadingState: () => {
    const { Text, View } = require('react-native');
    return (
      <View testID="loading-state">
        <Text>Loading...</Text>
      </View>
    );
  },
  ApplicationEmptyState: ({ onBack }: any) => {
    const { Text, TouchableOpacity, View } = require('react-native');
    return (
      <View testID="empty-state">
        <Text>No application found</Text>
        <TouchableOpacity onPress={onBack} testID="empty-back">
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">
    <NavigationContainer>{children}</NavigationContainer>
  </ThemeProvider>
);

describe('ApplicationReviewScreen Integration Tests', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  } as any;

  const mockApplication = {
    id: 'app-123',
    applicantName: 'John Doe',
    applicantEmail: 'john@example.com',
    applicantPhone: '+1234567890',
    applicantLocation: 'New York, NY',
    applicantExperience: '5 years with cats',
    homeType: 'house',
    hasChildren: true,
    hasOtherPets: true,
    yardSize: 'large',
    workSchedule: 'Full-time',
    applicationDate: '2024-01-20T00:00:00Z',
    status: 'pending',
    petName: 'Fluffy',
    petPhoto: 'https://example.com/photo.jpg',
    notes: 'Great applicant',
    questions: [{ question: 'Why adopt?', answer: 'Looking for companion' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading state when isLoading is true', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: null,
        isLoading: true,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestID('loading-state')).toBeTruthy();
      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when application is null', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: null,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestID('empty-state')).toBeTruthy();
      expect(screen.getByText('No application found')).toBeTruthy();
    });

    it('should navigate back when empty state back button is pressed', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: null,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      const backButton = screen.getByTestID('empty-back');
      backButton.props.onPress();

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Application Display', () => {
    it('should render all application sections when application is loaded', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: mockApplication,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestID('status-card')).toBeTruthy();
      expect(screen.getByTestID('contact-info')).toBeTruthy();
      expect(screen.getByTestID('home-lifestyle')).toBeTruthy();
      expect(screen.getByTestID('experience')).toBeTruthy();
      expect(screen.getByTestID('questions')).toBeTruthy();
      expect(screen.getByTestID('notes')).toBeTruthy();
      expect(screen.getByTestID('status-actions')).toBeTruthy();
      expect(screen.getByTestID('contact-actions')).toBeTruthy();
    });

    it('should display application status', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: mockApplication,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('pending')).toBeTruthy();
    });
  });

  describe('Status Updates', () => {
    it('should call updateStatus when approve button is pressed', () => {
      const mockUpdateStatus = jest.fn();
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: mockApplication,
        isLoading: false,
        updateStatus: mockUpdateStatus,
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      const approveButton = screen.getByTestID('approve-btn');
      approveButton.props.onPress();

      expect(mockUpdateStatus).toHaveBeenCalledWith('approved');
    });

    it('should call updateStatus when reject button is pressed', () => {
      const mockUpdateStatus = jest.fn();
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: mockApplication,
        isLoading: false,
        updateStatus: mockUpdateStatus,
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      const rejectButton = screen.getByTestID('reject-btn');
      rejectButton.props.onPress();

      expect(mockUpdateStatus).toHaveBeenCalledWith('rejected');
    });
  });

  describe('Navigation', () => {
    it('should navigate back when header back button is pressed', () => {
      (useApplicationReview as jest.Mock).mockReturnValue({
        application: mockApplication,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      const backButton = screen.getByTestID('header-back');
      backButton.props.onPress();

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle application with minimal data', () => {
      const minimalApp = {
        id: 'app-min',
        applicantName: 'Min',
        applicantEmail: 'min@example.com',
        applicantPhone: '',
        applicantLocation: '',
        applicantExperience: '',
        homeType: '',
        hasChildren: false,
        hasOtherPets: false,
        yardSize: '',
        workSchedule: '',
        applicationDate: '2024-01-01T00:00:00Z',
        status: 'pending' as const,
        petName: 'Pet',
        petPhoto: '',
        notes: '',
        questions: [],
      };

      (useApplicationReview as jest.Mock).mockReturnValue({
        application: minimalApp,
        isLoading: false,
        updateStatus: jest.fn(),
        reload: jest.fn(),
      });

      render(
        <TestWrapper>
          <ApplicationReviewScreen
            navigation={mockNavigation}
            route={{ params: { applicationId: 'app-min' }, key: 'review' } as any}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestID('status-card')).toBeTruthy();
    });

    it('should handle different application statuses', () => {
      const statuses = ['pending', 'approved', 'rejected', 'interview'] as const;

      statuses.forEach((status) => {
        (useApplicationReview as jest.Mock).mockReturnValue({
          application: { ...mockApplication, status },
          isLoading: false,
          updateStatus: jest.fn(),
          reload: jest.fn(),
        });

        const { unmount } = render(
          <TestWrapper>
            <ApplicationReviewScreen
              navigation={mockNavigation}
              route={{ params: { applicationId: 'app-123' }, key: 'review' } as any}
            />
          </TestWrapper>,
        );

        expect(screen.getByText(status)).toBeTruthy();
        unmount();
      });
    });
  });
});

