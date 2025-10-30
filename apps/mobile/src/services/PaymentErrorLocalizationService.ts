/**
 * Payment Error Localization Service
 *
 * Provides localized, user-friendly error messages for payment flows
 * using the enhanced i18n translations
 */

import { Alert } from 'react-native';
import i18n from '../i18n';

export type PaymentErrorType =
  | 'payment_declined'
  | 'insufficient_funds'
  | 'card_expired'
  | 'invalid_cvv'
  | 'invalid_card'
  | 'processing_error'
  | 'network_error'
  | 'subscription_failed'
  | 'subscription_cancelled'
  | 'restore_failed'
  | 'plan_not_found'
  | 'already_subscribed'
  | 'subscription_expired'
  | 'payment_method_required'
  | 'invalid_email'
  | 'weak_password'
  | 'password_mismatch'
  | 'account_suspended'
  | 'rate_limit_exceeded'
  | 'server_error'
  | 'maintenance_mode'
  | 'geo_restricted'
  | 'age_restricted'
  | 'terms_not_accepted'
  | 'generic_error';

export interface PaymentError {
  type: PaymentErrorType;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface LocalizedError {
  title: string;
  message: string;
  type: PaymentErrorType;
  shouldRetry?: boolean;
  contactSupport?: boolean;
}

export class PaymentErrorLocalizationService {
  private static instance: PaymentErrorLocalizationService;

  private constructor() {}

  static getInstance(): PaymentErrorLocalizationService {
    if (!PaymentErrorLocalizationService.instance) {
      PaymentErrorLocalizationService.instance = new PaymentErrorLocalizationService();
    }
    return PaymentErrorLocalizationService.instance;
  }

  /**
   * Map Stripe error codes to our error types
   */
  private mapStripeError(error: unknown): PaymentErrorType {
    if (typeof error !== 'object' || error === null) {
      return 'generic_error';
    }

    const err = error as Record<string, unknown>;
    const code = typeof err.code === 'string' ? err.code : undefined;
    const type = typeof err.type === 'string' ? err.type : undefined;
    const declineCode = typeof err.decline_code === 'string' ? err.decline_code : undefined;

    // Card declined errors
    if (type === 'card_error' || code === 'card_declined') {
      switch (declineCode) {
        case 'insufficient_funds':
          return 'insufficient_funds';
        case 'expired_card':
          return 'card_expired';
        case 'incorrect_cvc':
          return 'invalid_cvv';
        case 'invalid_number':
          return 'invalid_card';
        default:
          return 'payment_declined';
      }
    }

    // Network and processing errors
    if (code === 'rate_limit') {
      return 'rate_limit_exceeded';
    }
    if (type === 'api_connection_error') {
      return 'network_error';
    }
    if (type === 'api_error' || type === 'invalid_request_error') {
      return 'processing_error';
    }

    // Subscription specific errors
    if (code === 'subscription_duplicate') {
      return 'already_subscribed';
    }
    if (code === 'invalid_subscription_state') {
      return 'subscription_expired';
    }

    return 'generic_error';
  }

  /**
   * Get localized error message for payment error
   */
  getLocalizedError(error: PaymentError | string | unknown): LocalizedError {
    let errorType: PaymentErrorType;

    if (typeof error === 'string') {
      errorType = this.mapStripeError({ code: error });
    } else if (error && typeof error === 'object' && 'type' in error) {
      const paymentError = error as PaymentError;
      errorType = paymentError.type;
    } else if (error && typeof error === 'object') {
      errorType = this.mapStripeError(error);
    } else {
      errorType = 'generic_error';
    }

    const title = i18n.t('premium:errors.payment_failed');
    const message = i18n.t(`premium:errors.${errorType}`);

    // Determine if user should retry or contact support
    const shouldRetry = this.shouldRetryError(errorType);
    const contactSupport = this.shouldContactSupport(errorType);

    return {
      title: typeof title === 'string' ? title : 'Payment Error',
      message:
        typeof message === 'string' && message ? message : i18n.t('premium:errors.generic_error'),
      type: errorType,
      shouldRetry,
      contactSupport,
    };
  }

  /**
   * Show localized error alert
   */
  showErrorAlert(error: PaymentError | string | unknown, onRetry?: () => void): void {
    const localizedError = this.getLocalizedError(error);

    const buttons: { text: string; style: 'default'; onPress?: () => void }[] = [
      {
        text: i18n.t('common:ok'),
        style: 'default',
      },
    ];

    // Add retry button if applicable
    if (localizedError.shouldRetry && onRetry) {
      buttons.unshift({
        text: i18n.t('common:retry'),
        style: 'default',
        onPress: onRetry,
      });
    }

    // Add contact support button if needed
    if (localizedError.contactSupport) {
      buttons.push({
        text: i18n.t('common:contact_support'),
        style: 'default',
        onPress: () => {
          this.openSupportContact();
        },
      });
    }

    Alert.alert(localizedError.title, localizedError.message, buttons);
  }

  /**
   * Show localized success message
   */
  showSuccessAlert(messageKey: string, values?: Record<string, unknown>): void {
    const title = i18n.t('premium:success_title');
    const message = i18n.t(`premium:${messageKey}`, values);

    Alert.alert(title, message, [
      {
        text: i18n.t('common:ok'),
        style: 'default' as const,
      },
    ]);
  }

  /**
   * Get localized form field labels and hints
   */
  getPaymentFormLabels(): {
    cardNumber: { label: string; hint: string };
    expiryDate: { label: string; hint: string };
    cvv: { label: string; hint: string };
    cardholderName: { label: string; hint: string };
    payButton: string;
    processing: string;
  } {
    return {
      cardNumber: {
        label: i18n.t('premium:payment.card_number'),
        hint: i18n.t('premium:payment.card_number_hint'),
      },
      expiryDate: {
        label: i18n.t('premium:payment.expiry_date'),
        hint: i18n.t('premium:payment.expiry_date_hint'),
      },
      cvv: {
        label: i18n.t('premium:payment.cvv'),
        hint: i18n.t('premium:payment.cvv_hint'),
      },
      cardholderName: {
        label: i18n.t('premium:payment.cardholder_name'),
        hint: i18n.t('premium:payment.cardholder_name_hint'),
      },
      payButton: i18n.t('premium:payment.pay_now'),
      processing: i18n.t('premium:payment.processing'),
    };
  }

  /**
   * Get localized subscription status labels
   */
  getSubscriptionStatusLabels(): Record<string, string> {
    return {
      active: i18n.t('premium:subscription.active'),
      cancelled: i18n.t('premium:subscription.cancelled'),
      expired: i18n.t('premium:subscription.expired'),
      past_due: i18n.t('premium:subscription.past_due'),
      unpaid: i18n.t('premium:subscription.unpaid'),
      on_trial: i18n.t('premium:subscription.on_trial'),
    };
  }

  /**
   * Get localized restore purchase messages
   */
  getRestorePurchaseLabels(): {
    restoreButton: string;
    restoring: string;
    success: string;
    noPurchases: string;
    failed: string;
  } {
    return {
      restoreButton: i18n.t('premium:restore.restore_purchases'),
      restoring: i18n.t('premium:restore.restoring'),
      success: i18n.t('premium:restore.restore_success'),
      noPurchases: i18n.t('premium:restore.restore_no_purchases'),
      failed: i18n.t('premium:restore.restore_failed'),
    };
  }

  /**
   * Determine if error should allow retry
   */
  private shouldRetryError(errorType: PaymentErrorType): boolean {
    const retryableErrors = [
      'processing_error',
      'network_error',
      'rate_limit_exceeded',
      'server_error',
      'maintenance_mode',
    ];

    return retryableErrors.includes(errorType);
  }

  /**
   * Determine if error should suggest contacting support
   */
  private shouldContactSupport(errorType: PaymentErrorType): boolean {
    const supportErrors = [
      'account_suspended',
      'geo_restricted',
      'age_restricted',
      'server_error',
      'generic_error',
    ];

    return supportErrors.includes(errorType);
  }

  /**
   * Open support contact (placeholder implementation)
   */
  private openSupportContact(): void {
    // This would open email, chat, or help center
    // Implementation would depend on your support system
    // Could open email app, in-app chat, or external help center
  }

  /**
   * Format amount with currency for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(amount / 100); // Convert from cents if needed
  }

  /**
   * Format date for subscription display
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get localized confirmation message for payment
   */
  getPaymentConfirmation(
    amount: number,
    currency: string = 'USD',
  ): {
    title: string;
    message: string;
  } {
    const formattedAmount = this.formatAmount(amount, currency);
    return {
      title: i18n.t('premium:payment.confirm_payment', { amount: formattedAmount }),
      message: i18n.t('premium:secure_payment'),
    };
  }
}

// Export singleton instance
export const paymentErrorService = PaymentErrorLocalizationService.getInstance();

// Export types (already exported above)
export default paymentErrorService;
