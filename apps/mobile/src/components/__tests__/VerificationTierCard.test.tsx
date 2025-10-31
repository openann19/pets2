/**
 * Component tests for VerificationTierCard
 *
 * Tests statuses (pending/approved/rejected/requires_info), badge mapping
 * as defined in Test Plan v1.0
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react';
import { VerificationTierCard } from '../components/VerificationTierCard';

describe('VerificationTierCard', () => {
  const defaultProps = {
    tier: 1,
    status: 'unverified' as const,
    onStartVerification: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Display', () => {
    it('should display unverified status correctly', () => {
      const { getByText, getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unverified"
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('Not Started')).toBeTruthy();
      expect(getByTestId('status-indicator-unverified')).toBeTruthy();
      expect(getByText('Start Verification')).toBeTruthy();
    });

    it('should display pending status correctly', () => {
      const { getByText, getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('In Review')).toBeTruthy();
      expect(getByTestId('status-indicator-pending')).toBeTruthy();
      expect(getByText('View Status')).toBeTruthy();
    });

    it('should display approved status with badge correctly', () => {
      const { getByText, getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('Verified')).toBeTruthy();
      expect(getByTestId('status-indicator-approved')).toBeTruthy();
      expect(getByTestId('verification-badge-id_verified')).toBeTruthy();
      expect(getByText('View Details')).toBeTruthy();
    });

    it('should display rejected status correctly', () => {
      const { getByText, getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="rejected"
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('Rejected')).toBeTruthy();
      expect(getByTestId('status-indicator-rejected')).toBeTruthy();
      expect(getByText('Try Again')).toBeTruthy();
    });

    it('should display requires_info status correctly', () => {
      const { getByText, getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="requires_info"
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('Additional Info Needed')).toBeTruthy();
      expect(getByTestId('status-indicator-requires_info')).toBeTruthy();
      expect(getByText('Provide Info')).toBeTruthy();
    });
  });

  describe('Badge Mapping', () => {
    it('should show id_verified badge for Tier 1 approval', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      expect(getByTestId('verification-badge-id_verified')).toBeTruthy();
    });

    it('should show premium_verified badge for Tier 2 approval', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          tier={2}
          status="approved"
        />,
      );

      expect(getByTestId('verification-badge-premium_verified')).toBeTruthy();
    });

    it('should not show badge when not approved', () => {
      const { queryByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
        />,
      );

      expect(queryByTestId('verification-badge-id_verified')).toBeNull();
    });
  });

  describe('Tier Differences', () => {
    it('should display Tier 1 specific content', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          tier={1}
        />,
      );

      expect(getByText('Tier 1 Verification')).toBeTruthy();
      expect(getByText('Basic identity verification')).toBeTruthy();
    });

    it('should display Tier 2 specific content', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          tier={2}
        />,
      );

      expect(getByText('Tier 2 Verification')).toBeTruthy();
      expect(getByText('Advanced verification with documents')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should call onStartVerification for unverified status', () => {
      const mockOnStart = jest.fn();
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unverified"
          onStartVerification={mockOnStart}
        />,
      );

      fireEvent.press(getByText('Start Verification'));
      expect(mockOnStart).toHaveBeenCalledWith(1);
    });

    it('should call onViewDetails for pending status', () => {
      const mockOnViewDetails = jest.fn();
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
          onViewDetails={mockOnViewDetails}
        />,
      );

      fireEvent.press(getByText('View Status'));
      expect(mockOnViewDetails).toHaveBeenCalledWith(1, 'pending');
    });

    it('should call onViewDetails for approved status', () => {
      const mockOnViewDetails = jest.fn();
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
          onViewDetails={mockOnViewDetails}
        />,
      );

      fireEvent.press(getByText('View Details'));
      expect(mockOnViewDetails).toHaveBeenCalledWith(1, 'approved');
    });

    it('should call onStartVerification for rejected status', () => {
      const mockOnStart = jest.fn();
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="rejected"
          onStartVerification={mockOnStart}
        />,
      );

      fireEvent.press(getByText('Try Again'));
      expect(mockOnStart).toHaveBeenCalledWith(1);
    });

    it('should call onStartVerification for requires_info status', () => {
      const mockOnStart = jest.fn();
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="requires_info"
          onStartVerification={mockOnStart}
        />,
      );

      fireEvent.press(getByText('Provide Info'));
      expect(mockOnStart).toHaveBeenCalledWith(1);
    });
  });

  describe('Visual Indicators', () => {
    it('should show correct status colors', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      const indicator = getByTestId('status-indicator-approved');
      expect(indicator).toHaveStyle({ backgroundColor: '#4CAF50' }); // Green for approved
    });

    it('should show progress indicator for pending status', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
        />,
      );

      expect(getByTestId('status-progress-indicator')).toBeTruthy();
    });

    it('should show warning icon for rejected status', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="rejected"
        />,
      );

      expect(getByTestId('status-warning-icon')).toBeTruthy();
    });

    it('should show info icon for requires_info status', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          status="requires_info"
        />,
      );

      expect(getByTestId('status-info-icon')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByLabelText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      expect(getByLabelText('Tier 1 Verification, Verified')).toBeTruthy();
      expect(getByLabelText('View verification details')).toBeTruthy();
    });

    it('should announce status changes', () => {
      const { rerender } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unverified"
        />,
      );

      rerender(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      // Accessibility announcement should be made
      expect(mockAccessibilityAnnounce).toHaveBeenCalledWith('Verification approved');
    });

    it('should support screen reader navigation', () => {
      const { getByA11yHint } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
        />,
      );

      expect(getByA11yHint('Double tap to view verification status')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during verification start', async () => {
      const mockOnStart = jest
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unverified"
          onStartVerification={mockOnStart}
        />,
      );

      fireEvent.press(getByText('Start Verification'));

      expect(getByText('Starting...')).toBeTruthy();

      await waitFor(() => {
        expect(getByText('Start Verification')).toBeTruthy();
      });
    });

    it('should disable buttons during loading', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          isLoading
        />,
      );

      const button = getByText('Start Verification');
      expect(button).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          error="Verification service unavailable"
        />,
      );

      expect(getByText('Verification service unavailable')).toBeTruthy();
    });

    it('should show retry option for errors', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          error="Network error"
          onRetry={jest.fn()}
        />,
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should clear errors when retrying', () => {
      const mockOnRetry = jest.fn();
      const { getByText, queryByText } = render(
        <VerificationTierCard
          {...defaultProps}
          error="Network error"
          onRetry={mockOnRetry}
        />,
      );

      fireEvent.press(getByText('Retry'));

      expect(mockOnRetry).toHaveBeenCalled();
      // Error should be cleared by parent component
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid tier numbers', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          tier={99}
        />,
      );

      expect(getByText('Tier 99 Verification')).toBeTruthy();
    });

    it('should handle unknown status gracefully', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unknown"
          as
          any
        />,
      );

      expect(getByText('Unknown Status')).toBeTruthy();
    });

    it('should handle missing callback functions', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          onStartVerification={undefined}
          onViewDetails={undefined}
        />,
      );

      // Should not crash when buttons are pressed
      fireEvent.press(getByText('Start Verification'));
      // No error should occur
    });
  });

  describe('Internationalization', () => {
    it('should display localized status text', () => {
      // Mock i18n
      jest.mock('react-i18next', () => ({
        useTranslation: () => ({
          t: (key: string) => {
            const translations: Record<string, string> = {
              'verification.tier1': 'Tier 1 Verification',
              'verification.status.approved': 'Verified',
              'verification.start': 'Start Verification',
            };
            return translations[key] || key;
          },
        }),
      }));

      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      expect(getByText('Verified')).toBeTruthy();
    });

    it('should support RTL layouts', () => {
      const { getByTestId } = render(
        <VerificationTierCard
          {...defaultProps}
          isRTL
        />,
      );

      const card = getByTestId('verification-card');
      expect(card).toHaveStyle({ flexDirection: 'row-reverse' });
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderCount = jest.fn();
      const TestWrapper = (props: any) => {
        renderCount();
        return <VerificationTierCard {...props} />;
      };

      const { rerender } = render(<TestWrapper {...defaultProps} />);

      expect(renderCount).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper {...defaultProps} />);

      expect(renderCount).toHaveBeenCalledTimes(1); // Should not re-render
    });

    it('should memoize expensive computations', () => {
      const expensiveComputation = jest.fn(() => 'computed-value');

      // Mock component that uses memoization
      const { rerender } = render(
        <VerificationTierCard
          {...defaultProps}
          expensiveProp={expensiveComputation}
        />,
      );

      expect(expensiveComputation).toHaveBeenCalledTimes(1);

      rerender(
        <VerificationTierCard
          {...defaultProps}
          expensiveProp={expensiveComputation}
        />,
      );

      expect(expensiveComputation).toHaveBeenCalledTimes(1); // Should be memoized
    });
  });

  describe('Integration with Verification Flow', () => {
    it('should update status when verification completes', () => {
      const { rerender } = render(
        <VerificationTierCard
          {...defaultProps}
          status="unverified"
        />,
      );

      // Simulate verification completion
      rerender(
        <VerificationTierCard
          {...defaultProps}
          status="approved"
        />,
      );

      expect(screen.getByText('Verified')).toBeTruthy();
      expect(screen.getByTestId('verification-badge-id_verified')).toBeTruthy();
    });

    it('should handle verification timeout', () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
        />,
      );

      // Fast forward time to simulate timeout
      jest.advanceTimersByTime(300000); // 5 minutes

      expect(getByText('Verification timed out')).toBeTruthy();

      jest.useRealTimers();
    });

    it('should show estimated completion time', () => {
      const { getByText } = render(
        <VerificationTierCard
          {...defaultProps}
          status="pending"
          estimatedCompletion="2024-01-01T15:30:00Z"
        />,
      );

      expect(getByText('Estimated completion: 3:30 PM')).toBeTruthy();
    });
  });
});

// Mock functions for accessibility
const mockAccessibilityAnnounce = jest.fn();

// Note: @react-native-community/accessibility doesn't exist
// Use react-native's AccessibilityInfo instead, which is already mocked in jest.setup.ts
// Remove this mock - accessibility should come from react-native
