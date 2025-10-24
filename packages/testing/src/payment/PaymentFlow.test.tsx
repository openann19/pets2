/**
 * Payment Flow Testing Suite
 * Comprehensive tests for payment processing, error handling, and edge cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PaymentErrorBoundary } from '../../ui/src/components/Payment/PaymentErrorBoundary';
import { errorHandler } from '../../core/src/services/ErrorHandler';
import { logger } from '../../core/src/services/Logger';

// Mock dependencies
jest.mock('../../core/src/services/ErrorHandler');
jest.mock('../../core/src/services/Logger');

const mockErrorHandler = errorHandler as jest.Mocked<typeof errorHandler>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock Stripe
const mockStripe = {
  createPaymentMethod: jest.fn(),
  confirmCardPayment: jest.fn(),
  createPaymentIntent: jest.fn(),
  retrievePaymentIntent: jest.fn(),
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));

// Test payment component
const TestPaymentComponent = ({ 
  shouldThrow = false, 
  errorType = 'generic',
  paymentMethod = 'Visa',
  amount = 29.99,
  currency = 'USD'
}: {
  shouldThrow?: boolean;
  errorType?: string;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
}) => {
  if (shouldThrow) {
    const errorMessage = errorType === 'card' 
      ? 'Your card was declined.' 
      : errorType === 'network'
      ? 'Network request failed'
      : errorType === 'security'
      ? 'Your payment was declined due to security reasons'
      : errorType === 'limit'
      ? 'Payment amount exceeds the allowed limit'
      : 'Payment processing failed';
    throw new Error(errorMessage);
  }

  return (
    <div>
      <h2>Payment Form</h2>
      <p>Payment Method: {paymentMethod}</p>
      <p>Amount: {currency} {amount}</p>
      <button>Process Payment</button>
    </div>
  );
};

describe('Payment Flow Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Card Declined Errors', () => {
    it('displays appropriate message for card declined', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Visa" amount={29.99} currency="USD">
          <TestPaymentComponent shouldThrow={true} errorType="card" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Payment Declined')).toBeInTheDocument();
      expect(screen.getByText(/Your payment method was declined/)).toBeInTheDocument();
    });

    it('shows relevant suggestions for card declined', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="card" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Check that your card details are correct/)).toBeInTheDocument();
      expect(screen.getByText(/Ensure you have sufficient funds/)).toBeInTheDocument();
      expect(screen.getByText(/Try a different payment method/)).toBeInTheDocument();
    });
  });

  describe('Network Errors', () => {
    it('displays appropriate message for network errors', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="network" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
      expect(screen.getByText(/network connection issue/)).toBeInTheDocument();
    });

    it('shows relevant suggestions for network errors', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="network" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
      expect(screen.getByText(/Try again in a few moments/)).toBeInTheDocument();
    });
  });

  describe('Security Errors', () => {
    it('displays appropriate message for security errors', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="security" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Security Check Required')).toBeInTheDocument();
      expect(screen.getByText(/flagged for additional security verification/)).toBeInTheDocument();
    });

    it('shows relevant suggestions for security errors', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="security" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Try using a different payment method/)).toBeInTheDocument();
      expect(screen.getByText(/Contact your bank to authorize/)).toBeInTheDocument();
    });
  });

  describe('Payment Limit Errors', () => {
    it('displays appropriate message for limit exceeded', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="limit" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Payment Limit Exceeded')).toBeInTheDocument();
      expect(screen.getByText(/exceeds the allowed limit/)).toBeInTheDocument();
    });

    it('shows relevant suggestions for limit errors', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="limit" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Try a smaller amount/)).toBeInTheDocument();
      expect(screen.getByText(/Use a different payment method/)).toBeInTheDocument();
    });
  });

  describe('Payment Details Display', () => {
    it('shows payment details when provided', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Mastercard" amount={99.99} currency="EUR">
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Amount: EUR 99.99')).toBeInTheDocument();
      expect(screen.getByText('Method: Mastercard')).toBeInTheDocument();
    });

    it('hides payment details when not provided', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.queryByText(/Amount:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Method:/)).not.toBeInTheDocument();
    });
  });

  describe('Payment Actions', () => {
    it('shows retry payment button', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Try Payment Again')).toBeInTheDocument();
    });

    it('shows cancel payment button', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Cancel Payment')).toBeInTheDocument();
    });

    it('shows contact support button', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('shows security notice', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Your payment information is secure/)).toBeInTheDocument();
    });
  });

  describe('Payment Retry Logic', () => {
    it('limits payment retries to 2 attempts', async () => {
      const { rerender } = render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      // Simulate retries
      for (let i = 0; i < 2; i++) {
        const retryButton = screen.getByText('Try Payment Again');
        fireEvent.click(retryButton);
        
        expect(screen.getByText('Retrying Payment...')).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText('Retrying Payment...')).not.toBeInTheDocument();
        });

        // Re-trigger error
        rerender(
          <PaymentErrorBoundary>
            <TestPaymentComponent shouldThrow={true} />
          </PaymentErrorBoundary>
        );
      }

      // After 2 retries, retry button should not be available
      expect(screen.queryByText('Try Payment Again')).not.toBeInTheDocument();
    });

    it('calls custom retry handler when provided', async () => {
      const mockRetry = jest.fn();

      render(
        <PaymentErrorBoundary onRetry={mockRetry}>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      const retryButton = screen.getByText('Try Payment Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetry).toHaveBeenCalled();
      });
    });
  });

  describe('Payment Error Processing', () => {
    it('processes payment errors through error handler', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Visa" amount={29.99} currency="USD">
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(mockErrorHandler.handlePaymentError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'PaymentFlow',
          action: 'payment_processing',
          severity: 'high',
          metadata: expect.objectContaining({
            paymentMethod: 'Visa',
            amount: 29.99,
            currency: 'USD',
          }),
        })
      );
    });

    it('logs payment errors with context', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="card" />
        </PaymentErrorBoundary>
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Payment Error Boundary caught an error',
        expect.objectContaining({
          component: 'PaymentErrorBoundary',
          action: 'payment_error',
          metadata: expect.objectContaining({
            errorType: 'card',
          }),
        })
      );
    });
  });

  describe('Custom Error Handlers', () => {
    it('calls custom error handler when provided', () => {
      const mockOnError = jest.fn();

      render(
        <PaymentErrorBoundary onError={mockOnError}>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('calls custom cancel handler when provided', () => {
      const mockOnCancel = jest.fn();

      render(
        <PaymentErrorBoundary onCancel={mockOnCancel}>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      const cancelButton = screen.getByText('Cancel Payment');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});

describe('Payment Flow Integration', () => {
  describe('Stripe Integration', () => {
    it('handles Stripe payment method creation errors', async () => {
      mockStripe.createPaymentMethod.mockRejectedValue(new Error('Card declined'));

      const PaymentForm = () => {
        const handlePayment = async () => {
          try {
            await mockStripe.createPaymentMethod({
              type: 'card',
              card: { token: 'tok_test' }
            });
          } catch (error) {
            throw error;
          }
        };

        return (
          <PaymentErrorBoundary>
            <button onClick={handlePayment}>Process Payment</button>
          </PaymentErrorBoundary>
        );
      };

      render(<PaymentForm />);

      const paymentButton = screen.getByText('Process Payment');
      fireEvent.click(paymentButton);

      await waitFor(() => {
        expect(screen.getByText('Payment Declined')).toBeInTheDocument();
      });
    });

    it('handles Stripe payment intent confirmation errors', async () => {
      mockStripe.confirmCardPayment.mockRejectedValue(new Error('Payment failed'));

      const PaymentForm = () => {
        const handlePayment = async () => {
          try {
            await mockStripe.confirmCardPayment('pi_test', {
              payment_method: { card: 'pm_test' }
            });
          } catch (error) {
            throw error;
          }
        };

        return (
          <PaymentErrorBoundary>
            <button onClick={handlePayment}>Confirm Payment</button>
          </PaymentErrorBoundary>
        );
      };

      render(<PaymentForm />);

      const paymentButton = screen.getByText('Confirm Payment');
      fireEvent.click(paymentButton);

      await waitFor(() => {
        expect(screen.getByText('Payment Processing Error')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Flow Edge Cases', () => {
    it('handles multiple payment errors gracefully', async () => {
      const { rerender } = render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="card" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Payment Declined')).toBeInTheDocument();

      // Change error type
      rerender(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} errorType="network" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
    });

    it('handles payment errors with missing metadata', () => {
      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Payment Processing Error')).toBeInTheDocument();
      expect(screen.queryByText(/Amount:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Method:/)).not.toBeInTheDocument();
    });

    it('handles payment errors in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <PaymentErrorBoundary>
          <TestPaymentComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
