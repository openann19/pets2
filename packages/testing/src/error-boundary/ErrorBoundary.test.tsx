/**
 * Error Boundary Testing Suite
 * Comprehensive tests for error boundary components and error handling
 */

import React, { Component, ErrorInfo } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import { EnhancedErrorBoundary } from '../../ui/src/components/ErrorBoundary/EnhancedErrorBoundary';
import { PaymentErrorBoundary } from '../../ui/src/components/Payment/PaymentErrorBoundary';
import { errorHandler } from '../../core/src/services/ErrorHandler';
import { logger } from '../../core/src/services/Logger';

// Mock the error handler and logger
jest.mock('../../core/src/services/ErrorHandler');
jest.mock('../../core/src/services/Logger');

const mockErrorHandler = errorHandler as jest.Mocked<typeof errorHandler>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Test component that throws an error
class ErrorComponent extends Component<{ shouldThrow?: boolean }> {
  componentDidMount() {
    if (this.props.shouldThrow) {
      throw new Error('Test error message');
    }
  }

  render() {
    if (this.props.shouldThrow) {
      throw new Error('Test error message');
    }
    return <div>Normal content</div>;
  }
}

// Test component for payment errors
class PaymentErrorComponent extends Component<{ shouldThrow?: boolean; errorType?: string }> {
  componentDidMount() {
    if (this.props.shouldThrow) {
      const errorMessage = this.props.errorType === 'card' 
        ? 'Card declined' 
        : this.props.errorType === 'network'
        ? 'Network connection failed'
        : 'Payment processing error';
      throw new Error(errorMessage);
    }
  }

  render() {
    if (this.props.shouldThrow) {
      const errorMessage = this.props.errorType === 'card' 
        ? 'Card declined' 
        : this.props.errorType === 'network'
        ? 'Network connection failed'
        : 'Payment processing error';
      throw new Error(errorMessage);
    }
    return <div>Payment form content</div>;
  }
}

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders children when there is no error', () => {
      render(
        <EnhancedErrorBoundary>
          <div>Normal content</div>
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('catches and displays error when child component throws', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it('logs error when caught', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'React Error Boundary caught an error',
        expect.objectContaining({
          component: 'EnhancedErrorBoundary',
          action: 'component_did_catch',
          metadata: expect.objectContaining({
            level: 'component',
            errorBoundary: true,
          }),
        })
      );
    });

    it('processes error through error handler', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'ReactComponent',
          action: 'render_error',
          severity: 'high',
        })
      );
    });
  });

  describe('Error Levels', () => {
    it('displays critical error styling for critical level', () => {
      render(
        <EnhancedErrorBoundary level="critical">
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Critical Error')).toBeInTheDocument();
      expect(screen.getByText(/A critical error occurred/)).toBeInTheDocument();
    });

    it('displays page error styling for page level', () => {
      render(
        <EnhancedErrorBoundary level="page">
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const container = screen.getByText('Something went wrong').closest('.error-boundary');
      expect(container).toHaveClass('min-h-screen');
    });
  });

  describe('Retry Functionality', () => {
    it('shows retry button by default', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('hides retry button when showRetryButton is false', () => {
      render(
        <EnhancedErrorBoundary showRetryButton={false}>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('retries when retry button is clicked', async () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(screen.getByText('Retrying...')).toBeInTheDocument();
    });

    it('limits retry attempts', async () => {
      const { rerender } = render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // Simulate multiple retries
      for (let i = 0; i < 3; i++) {
        const retryButton = screen.getByText('Try Again');
        fireEvent.click(retryButton);
        
        // Wait for retry to complete
        await waitFor(() => {
          expect(screen.queryByText('Retrying...')).not.toBeInTheDocument();
        });

        // Re-trigger error
        rerender(
          <EnhancedErrorBoundary>
            <ErrorComponent shouldThrow={true} />
          </EnhancedErrorBoundary>
        );
      }

      // After 3 retries, retry button should not be available
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows home button by default', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });

    it('hides home button when showHomeButton is false', () => {
      render(
        <EnhancedErrorBoundary showHomeButton={false}>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.queryByText('Go to Home')).not.toBeInTheDocument();
    });

    it('shows reload button', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('shows report error button by default', () => {
      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Report Error')).toBeInTheDocument();
    });

    it('hides report button when showReportButton is false', () => {
      render(
        <EnhancedErrorBoundary showReportButton={false}>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.queryByText('Report Error')).not.toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <EnhancedErrorBoundary fallback={customFallback}>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('shows error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    });

    it('hides error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <EnhancedErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();
    });
  });

  describe('Custom Error Handler', () => {
    it('calls custom error handler when provided', () => {
      const customErrorHandler = jest.fn();

      render(
        <EnhancedErrorBoundary onError={customErrorHandler}>
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(customErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });
});

describe('PaymentErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Payment-Specific Error Handling', () => {
    it('displays card declined error message', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Visa" amount={29.99} currency="USD">
          <PaymentErrorComponent shouldThrow={true} errorType="card" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Payment Declined')).toBeInTheDocument();
      expect(screen.getByText(/Your payment method was declined/)).toBeInTheDocument();
    });

    it('displays network error message', () => {
      render(
        <PaymentErrorBoundary>
          <PaymentErrorComponent shouldThrow={true} errorType="network" />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Connection Issue')).toBeInTheDocument();
      expect(screen.getByText(/network connection issue/)).toBeInTheDocument();
    });

    it('displays payment details when provided', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Visa" amount={29.99} currency="USD">
          <PaymentErrorComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Amount: USD 29.99')).toBeInTheDocument();
      expect(screen.getByText('Method: Visa')).toBeInTheDocument();
    });
  });

  describe('Payment Retry Logic', () => {
    it('limits payment retries to 2 attempts', async () => {
      const { rerender } = render(
        <PaymentErrorBoundary>
          <PaymentErrorComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      // Simulate retries
      for (let i = 0; i < 2; i++) {
        const retryButton = screen.getByText('Try Payment Again');
        fireEvent.click(retryButton);
        
        await waitFor(() => {
          expect(screen.queryByText('Retrying Payment...')).not.toBeInTheDocument();
        });

        // Re-trigger error
        rerender(
          <PaymentErrorBoundary>
            <PaymentErrorComponent shouldThrow={true} />
          </PaymentErrorBoundary>
        );
      }

      // After 2 retries, retry button should not be available
      expect(screen.queryByText('Try Payment Again')).not.toBeInTheDocument();
    });
  });

  describe('Payment Actions', () => {
    it('shows cancel payment button', () => {
      render(
        <PaymentErrorBoundary>
          <PaymentErrorComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Cancel Payment')).toBeInTheDocument();
    });

    it('shows contact support button', () => {
      render(
        <PaymentErrorBoundary>
          <PaymentErrorComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('shows security notice', () => {
      render(
        <PaymentErrorBoundary>
          <PaymentErrorComponent shouldThrow={true} />
        </PaymentErrorBoundary>
      );

      expect(screen.getByText(/Your payment information is secure/)).toBeInTheDocument();
    });
  });

  describe('Error Processing', () => {
    it('processes payment errors through error handler', () => {
      render(
        <PaymentErrorBoundary paymentMethod="Visa" amount={29.99} currency="USD">
          <PaymentErrorComponent shouldThrow={true} />
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
  });
});

describe('Error Boundary Integration', () => {
  it('works with motion components', () => {
    const MotionErrorComponent = motion.div;
    
    render(
      <EnhancedErrorBoundary>
        <MotionErrorComponent>
          <ErrorComponent shouldThrow={true} />
        </MotionErrorComponent>
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('handles multiple nested error boundaries', () => {
    render(
      <EnhancedErrorBoundary level="page">
        <EnhancedErrorBoundary level="component">
          <ErrorComponent shouldThrow={true} />
        </EnhancedErrorBoundary>
      </EnhancedErrorBoundary>
    );

    // Should catch at the inner boundary
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
