/**
 * ContactActions Comprehensive Component Tests
 * Tests email, call, and message actions with Linking integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import { ThemeProvider } from '@mobile/theme';
import { ContactActions } from '../ContactActions';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      canOpenURL: jest.fn(),
      openURL: jest.fn(),
    },
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">{children}</ThemeProvider>
);

describe('ContactActions Component Tests', () => {
  const mockApplication = {
    id: 'app-1',
    applicantName: 'John Doe',
    applicantEmail: 'john@example.com',
    applicantPhone: '+1234567890',
    applicantLocation: 'New York, NY',
    applicantExperience: '5 years',
    homeType: 'house',
    hasChildren: false,
    hasOtherPets: false,
    yardSize: 'large',
    workSchedule: 'Full-time',
    applicationDate: '2024-01-20T00:00:00Z',
    status: 'pending' as const,
    petName: 'Fluffy',
    petPhoto: 'https://example.com/photo.jpg',
    notes: '',
    questions: [],
  };

  const defaultProps = {
    application: mockApplication,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render contact actions section successfully', () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Contact Applicant')).toBeTruthy();
    });

    it('should render all three contact action buttons', () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('contact-action-email')).toBeTruthy();
      expect(screen.getByTestID('contact-action-call')).toBeTruthy();
      expect(screen.getByTestID('contact-action-message')).toBeTruthy();
    });

    it('should display button labels', () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('Call')).toBeTruthy();
      expect(screen.getByText('Message')).toBeTruthy();
    });
  });

  describe('Email Action', () => {
    it('should call handleContactEmail when email button is pressed', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      });
    });

    it('should open email URL when permission granted', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(
          expect.stringContaining('mailto:john@example.com'),
        );
      });
    });

    it('should show alert when email cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Email Not Available',
          expect.stringContaining('john@example.com'),
        );
      });
    });

    it('should handle email open errors gracefully', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Email failed'));

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('Call Action', () => {
    it('should call handleContactCall when call button is pressed', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const callButton = screen.getByTestID('contact-action-call');
      fireEvent.press(callButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      });
    });

    it('should open phone URL when permission granted', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const callButton = screen.getByTestID('contact-action-call');
      fireEvent.press(callButton);

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('tel:+1234567890'));
      });
    });

    it('should show alert when call cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const callButton = screen.getByTestID('contact-action-call');
      fireEvent.press(callButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Call Not Available',
          expect.stringContaining('+1234567890'),
        );
      });
    });

    it('should handle call errors gracefully', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Call failed'));

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const callButton = screen.getByTestID('contact-action-call');
      fireEvent.press(callButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('Message Action', () => {
    it('should call handleContactMessage when message button is pressed', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const messageButton = screen.getByTestID('contact-action-message');
      fireEvent.press(messageButton);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      });
    });

    it('should open SMS URL when permission granted', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const messageButton = screen.getByTestID('contact-action-message');
      fireEvent.press(messageButton);

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('sms:+1234567890'));
      });
    });

    it('should show alert when SMS cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const messageButton = screen.getByTestID('contact-action-message');
      fireEvent.press(messageButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'SMS Not Available',
          expect.stringContaining('+1234567890'),
        );
      });
    });

    it('should handle message errors gracefully', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('SMS failed'));

      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const messageButton = screen.getByTestID('contact-action-message');
      fireEvent.press(messageButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
        expect(logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('contact-action-email')).toHaveAccessibilityLabel('Email applicant');
      expect(screen.getByTestID('contact-action-call')).toHaveAccessibilityLabel('Call applicant');
      expect(screen.getByTestID('contact-action-message')).toHaveAccessibilityLabel('Message applicant');
    });

    it('should have proper accessibility roles', () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      const callButton = screen.getByTestID('contact-action-call');
      const messageButton = screen.getByTestID('contact-action-message');

      expect(emailButton).toHaveAccessibilityRole('button');
      expect(callButton).toHaveAccessibilityRole('button');
      expect(messageButton).toHaveAccessibilityRole('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing phone number', () => {
      const appWithoutPhone = {
        ...mockApplication,
        applicantPhone: '',
      };

      render(
        <TestWrapper>
          <ContactActions application={appWithoutPhone} />
        </TestWrapper>,
      );

      // Should render without crashing
      expect(screen.getByText('Contact Applicant')).toBeTruthy();
    });

    it('should handle missing email', () => {
      const appWithoutEmail = {
        ...mockApplication,
        applicantEmail: '',
      };

      render(
        <TestWrapper>
          <ContactActions application={appWithoutEmail} />
        </TestWrapper>,
      );

      // Should render without crashing
      expect(screen.getByText('Contact Applicant')).toBeTruthy();
    });

    it('should handle rapid button presses', async () => {
      render(
        <TestWrapper>
          <ContactActions {...defaultProps} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);
      fireEvent.press(emailButton);
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Linking.canOpenURL).toHaveBeenCalled();
      });
    });

    it('should handle special characters in email', async () => {
      const appWithSpecialEmail = {
        ...mockApplication,
        applicantEmail: 'test+email@example.com',
      };

      render(
        <TestWrapper>
          <ContactActions application={appWithSpecialEmail} />
        </TestWrapper>,
      );

      const emailButton = screen.getByTestID('contact-action-email');
      fireEvent.press(emailButton);

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith(
          expect.stringContaining('test+email@example.com'),
        );
      });
    });
  });
});

