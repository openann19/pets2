/**
 * User Feedback System Testing Suite
 * Comprehensive tests for user feedback, notifications, and error messaging
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FeedbackProvider, useFeedback } from '../../ui/src/components/Feedback/UserFeedbackSystem';
import { errorHandler } from '../../core/src/services/ErrorHandler';
import { logger } from '../../core/src/services/Logger';

// Mock dependencies
jest.mock('../../core/src/services/ErrorHandler');
jest.mock('../../core/src/services/Logger');

const mockErrorHandler = errorHandler as jest.Mocked<typeof errorHandler>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Test component that uses feedback
const TestComponent = () => {
  const feedback = useFeedback();

  return (
    <div>
      <button
        data-testid="show-success"
        onClick={() => feedback.showSuccess('Success!', 'Operation completed successfully')}
      >
        Show Success
      </button>
      <button
        data-testid="show-error"
        onClick={() => feedback.showError('Error!', 'Something went wrong')}
      >
        Show Error
      </button>
      <button
        data-testid="show-warning"
        onClick={() => feedback.showWarning('Warning!', 'Please be careful')}
      >
        Show Warning
      </button>
      <button
        data-testid="show-info"
        onClick={() => feedback.showInfo('Info!', 'Here is some information')}
      >
        Show Info
      </button>
      <button
        data-testid="show-api-error"
        onClick={() => feedback.showApiError(new Error('Network error'), 'test context')}
      >
        Show API Error
      </button>
      <button
        data-testid="show-payment-error"
        onClick={() => feedback.showPaymentError(new Error('Card declined'), { amount: 29.99 })}
      >
        Show Payment Error
      </button>
      <button
        data-testid="show-network-error"
        onClick={() => feedback.showNetworkError(new Error('Network failed'), () => {})}
      >
        Show Network Error
      </button>
      <button
        data-testid="show-validation-error"
        onClick={() => feedback.showValidationError(['Field is required', 'Invalid email format'])}
      >
        Show Validation Error
      </button>
      <button
        data-testid="clear-all"
        onClick={() => feedback.clearAllMessages()}
      >
        Clear All
      </button>
    </div>
  );
};

describe('UserFeedbackSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Feedback Types', () => {
    it('shows success message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('shows error message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));

      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows warning message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-warning'));

      expect(screen.getByText('Warning!')).toBeInTheDocument();
      expect(screen.getByText('Please be careful')).toBeInTheDocument();
    });

    it('shows info message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-info'));

      expect(screen.getByText('Info!')).toBeInTheDocument();
      expect(screen.getByText('Here is some information')).toBeInTheDocument();
    });
  });

  describe('Message Dismissal', () => {
    it('dismisses message when dismiss button is clicked', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));

      expect(screen.getByText('Success!')).toBeInTheDocument();

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    });

    it('auto-hides messages after duration', async () => {
      render(
        <FeedbackProvider defaultDuration={1000}>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-info'));

      expect(screen.getByText('Info!')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Info!')).not.toBeInTheDocument();
      });
    });

    it('does not auto-hide error messages by default', async () => {
      render(
        <FeedbackProvider defaultDuration={1000}>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));

      expect(screen.getByText('Error!')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Error messages should not auto-hide
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('clears all messages', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));
      fireEvent.click(screen.getByTestId('show-error'));
      fireEvent.click(screen.getByTestId('show-warning'));

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Warning!')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('clear-all'));

      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      expect(screen.queryByText('Error!')).not.toBeInTheDocument();
      expect(screen.queryByText('Warning!')).not.toBeInTheDocument();
    });
  });

  describe('Message Limits', () => {
    it('limits number of messages displayed', () => {
      render(
        <FeedbackProvider maxMessages={2}>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-success'));
      fireEvent.click(screen.getByTestId('show-error'));
      fireEvent.click(screen.getByTestId('show-warning'));

      // Only the last 2 messages should be visible
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Warning!')).toBeInTheDocument();
    });
  });

  describe('API Error Handling', () => {
    it('shows network error message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-api-error'));

      expect(screen.getByText('Request Failed')).toBeInTheDocument();
      expect(screen.getByText(/Network connection failed/)).toBeInTheDocument();
    });

    it('shows retry button for retryable errors', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-api-error'));

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles different API error types', () => {
      const TestApiErrors = () => {
        const feedback = useFeedback();

        return (
          <div>
            <button
              data-testid="unauthorized-error"
              onClick={() => feedback.showApiError(new Error('Unauthorized'), 'auth')}
            >
              Unauthorized Error
            </button>
            <button
              data-testid="timeout-error"
              onClick={() => feedback.showApiError(new Error('Request timeout'), 'timeout')}
            >
              Timeout Error
            </button>
            <button
              data-testid="server-error"
              onClick={() => feedback.showApiError(new Error('Internal server error'), 'server')}
            >
              Server Error
            </button>
          </div>
        );
      };

      render(
        <FeedbackProvider>
          <TestApiErrors />
        </FeedbackProvider>
      );

      // Test unauthorized error
      fireEvent.click(screen.getByTestId('unauthorized-error'));
      expect(screen.getByText(/session has expired/)).toBeInTheDocument();

      // Clear and test timeout error
      fireEvent.click(screen.getByTestId('clear-all'));
      fireEvent.click(screen.getByTestId('timeout-error'));
      expect(screen.getByText(/Request timed out/)).toBeInTheDocument();

      // Clear and test server error
      fireEvent.click(screen.getByTestId('clear-all'));
      fireEvent.click(screen.getByTestId('server-error'));
      expect(screen.getByText(/Server error occurred/)).toBeInTheDocument();
    });
  });

  describe('Payment Error Handling', () => {
    it('shows payment declined message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-payment-error'));

      expect(screen.getByText('Payment Declined')).toBeInTheDocument();
      expect(screen.getByText(/payment method was declined/)).toBeInTheDocument();
    });

    it('shows try again button for payment errors', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-payment-error'));

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('handles different payment error types', () => {
      const TestPaymentErrors = () => {
        const feedback = useFeedback();

        return (
          <div>
            <button
              data-testid="insufficient-funds"
              onClick={() => feedback.showPaymentError(new Error('Insufficient funds'))}
            >
              Insufficient Funds
            </button>
            <button
              data-testid="expired-card"
              onClick={() => feedback.showPaymentError(new Error('Card expired'))}
            >
              Expired Card
            </button>
            <button
              data-testid="security-check"
              onClick={() => feedback.showPaymentError(new Error('Security check required'))}
            >
              Security Check
            </button>
          </div>
        );
      };

      render(
        <FeedbackProvider>
          <TestPaymentErrors />
        </FeedbackProvider>
      );

      // Test insufficient funds
      fireEvent.click(screen.getByTestId('insufficient-funds'));
      expect(screen.getByText('Insufficient Funds')).toBeInTheDocument();

      // Clear and test expired card
      fireEvent.click(screen.getByTestId('clear-all'));
      fireEvent.click(screen.getByTestId('expired-card'));
      expect(screen.getByText('Card Expired')).toBeInTheDocument();

      // Clear and test security check
      fireEvent.click(screen.getByTestId('clear-all'));
      fireEvent.click(screen.getByTestId('security-check'));
      expect(screen.getByText('Security Check Required')).toBeInTheDocument();
    });
  });

  describe('Network Error Handling', () => {
    it('shows network error message', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-network-error'));

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
    });

    it('shows retry button when retry action is provided', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-network-error'));

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Validation Error Handling', () => {
    it('shows single validation error', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-validation-error'));

      expect(screen.getByText('Validation Error')).toBeInTheDocument();
      expect(screen.getByText(/Please fix 2 validation errors/)).toBeInTheDocument();
    });

    it('shows validation error details', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-validation-error'));

      const detailsButton = screen.getByText('Show details');
      fireEvent.click(detailsButton);

      expect(screen.getByText('Field is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  describe('Message Actions', () => {
    it('executes action when action button is clicked', () => {
      const TestAction = () => {
        const feedback = useFeedback();
        const [actionExecuted, setActionExecuted] = React.useState(false);

        const handleShowMessage = () => {
          feedback.showError('Test Error', 'Something went wrong', {
            action: {
              label: 'Fix It',
              handler: () => setActionExecuted(true),
            },
          });
        };

        return (
          <div>
            <button data-testid="show-with-action" onClick={handleShowMessage}>
              Show with Action
            </button>
            {actionExecuted && <div data-testid="action-executed">Action executed!</div>}
          </div>
        );
      };

      render(
        <FeedbackProvider>
          <TestAction />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-with-action'));

      const actionButton = screen.getByText('Fix It');
      fireEvent.click(actionButton);

      expect(screen.getByTestId('action-executed')).toBeInTheDocument();
    });
  });

  describe('Error Context Integration', () => {
    it('integrates with error handler for logging', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-api-error'));

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User requested retry for API error',
        expect.objectContaining({
          error: 'Network error',
          context: 'test context',
        })
      );
    });

    it('integrates with error handler for payment errors', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-payment-error'));

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User requested retry for payment error',
        expect.objectContaining({
          error: 'Card declined',
          paymentDetails: { amount: 29.99 },
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));

      const message = screen.getByText('Error!').closest('div');
      expect(message).toHaveAttribute('role', 'alert');
    });

    it('supports keyboard navigation', () => {
      render(
        <FeedbackProvider>
          <TestComponent />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-error'));

      const actionButton = screen.getByText('Try Again');
      expect(actionButton).toBeInTheDocument();
      
      // Test keyboard interaction
      actionButton.focus();
      expect(actionButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing context gracefully', () => {
      const TestWithoutContext = () => {
        const feedback = useFeedback();

        return (
          <button
            data-testid="show-without-context"
            onClick={() => feedback.showApiError(new Error('Test error'))}
          >
            Show without context
          </button>
        );
      };

      render(
        <FeedbackProvider>
          <TestWithoutContext />
        </FeedbackProvider>
      );

      fireEvent.click(screen.getByTestId('show-without-context'));

      expect(screen.getByText('Request Failed')).toBeInTheDocument();
    });

    it('handles rapid message creation', () => {
      render(
        <FeedbackProvider maxMessages={3}>
          <TestComponent />
        </FeedbackProvider>
      );

      // Rapidly create messages
      fireEvent.click(screen.getByTestId('show-success'));
      fireEvent.click(screen.getByTestId('show-error'));
      fireEvent.click(screen.getByTestId('show-warning'));
      fireEvent.click(screen.getByTestId('show-info'));

      // Should only show the last 3 messages
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Warning!')).toBeInTheDocument();
      expect(screen.getByText('Info!')).toBeInTheDocument();
    });
  });
});
