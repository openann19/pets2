/**
 * useStripePayment Hook
 * Handles Stripe payment processing and integration
 */
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { premiumService, type SubscriptionPlan } from '../../services/PremiumService';
import { paymentErrorService, type PaymentError } from '../../services/PaymentErrorLocalizationService';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  lastPaymentIntentId: string | null;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  paymentIntentId?: string;
}

interface UseStripePaymentReturn extends PaymentState {
  createCheckoutSession: (
    planId: string,
    successUrl?: string,
    cancelUrl?: string,
  ) => Promise<StripeCheckoutSession | null>;
  processPayment: (paymentMethodId: string, amount: number) => Promise<boolean>;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;
  handlePaymentSuccess: (sessionId: string) => Promise<void>;
  handlePaymentCancel: (sessionId: string) => void;
  clearError: () => void;
}

export const useStripePayment = (): UseStripePaymentReturn => {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    lastPaymentIntentId: null,
  });

  const createCheckoutSession = useCallback(
    async (
      planId: string,
      successUrl?: string,
      cancelUrl?: string,
    ): Promise<StripeCheckoutSession | null> => {
      try {
        setState((prev) => ({ ...prev, isProcessing: true, error: null }));

        const plans = premiumService.getAvailablePlans();
        const plan = plans.find((p) => p.id === planId);

        if (!plan) {
          const error: PaymentError = {
            type: 'plan_not_found',
            message: `Plan ${planId} not found`,
            code: 'PLAN_NOT_FOUND',
          };
          paymentErrorService.showErrorAlert(error);
          return null;
        }

        const session = await premiumService.createCheckoutSession(
          plan.stripePriceId,
          successUrl || 'pawfectmatch://subscription/success',
          cancelUrl || 'pawfectmatch://subscription/cancel',
        );

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          lastPaymentIntentId: session.sessionId,
        }));

        logger.info('Stripe checkout session created', {
          planId,
          sessionId: session.sessionId,
        });

        return {
          id: session.sessionId,
          url: session.url,
          paymentIntentId: session.sessionId, // In real implementation, this would be separate
        };
      } catch (error) {
        const paymentError: PaymentError = {
          type: 'processing_error',
          message: error instanceof Error ? error.message : 'Failed to create checkout session',
          code: 'CHECKOUT_SESSION_FAILED',
          details: { originalError: error },
        };
        
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: paymentError.message,
        }));
        
        logger.error('Failed to create Stripe checkout session', {
          error,
          planId,
        });

        paymentErrorService.showErrorAlert(paymentError, () => createCheckoutSession(planId, successUrl, cancelUrl));
        return null;
      }
    },
    [],
  );

  const processPayment = useCallback(
    async (paymentMethodId: string, amount: number): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isProcessing: true, error: null }));

        // In a real implementation, this would call Stripe's API directly
        // For now, we'll simulate the payment processing
        logger.info('Processing payment', { paymentMethodId, amount });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          setState((prev) => ({ ...prev, isProcessing: false }));
          logger.info('Payment processed successfully', {
            paymentMethodId,
            amount,
          });
          return true;
        } else {
          const paymentError: PaymentError = {
            type: 'insufficient_funds',
            message: 'Payment failed - insufficient funds',
            code: 'INSUFFICIENT_FUNDS',
          };
          throw paymentError;
        }
      } catch (error) {
        const paymentError: PaymentError = {
          type: 'payment_declined',
          message: error instanceof Error ? error.message : 'Payment processing failed',
          code: 'PAYMENT_FAILED',
          details: { originalError: error },
        };
        
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: paymentError.message,
        }));
        
        logger.error('Payment processing failed', {
          error,
          paymentMethodId,
          amount,
        });

        paymentErrorService.showErrorAlert(paymentError, () => processPayment(paymentMethodId, amount));
        return false;
      }
    },
    [],
  );

  const confirmPayment = useCallback(async (paymentIntentId: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isProcessing: true, error: null }));

      // In real implementation, this would confirm with Stripe
      logger.info('Confirming payment', { paymentIntentId });

      // Simulate confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        lastPaymentIntentId: paymentIntentId,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment confirmation failed';
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      logger.error('Payment confirmation failed', { error, paymentIntentId });
      return false;
    }
  }, []);

  const handlePaymentSuccess = useCallback(async (sessionId: string): Promise<void> => {
    try {
      // Refresh premium status after successful payment
      // This would typically be handled by the success screen
      logger.info('Payment success handled', { sessionId });

      setState((prev) => ({ ...prev, error: null }));
    } catch (error) {
      logger.error('Failed to handle payment success', { error, sessionId });
    }
  }, []);

  const handlePaymentCancel = useCallback((sessionId: string) => {
    logger.info('Payment cancelled', { sessionId });
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createCheckoutSession,
    processPayment,
    confirmPayment,
    handlePaymentSuccess,
    handlePaymentCancel,
    clearError,
  };
};
