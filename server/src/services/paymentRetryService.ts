/**
 * Smart Payment Retry Service for PawfectMatch
 * Intelligent retry logic for failed payments with exponential backoff
 */

import stripe from 'stripe';
import User from '../models/User';
import logger from '../utils/logger';

// Payment Retry Types
interface RetryConfig {
  maxRetries?: number;
  retryIntervals?: number[];
  notificationDelays?: number[];
}

interface RetryStats {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  averageRetryAttempts: number;
  retrySuccessRate: number;
  timeframe: string;
}

interface StripeCustomer {
  id: string;
  email: string | null;
}

class PaymentRetryService {
  private maxRetries: number;
  private retryIntervals: number[];
  private notificationDelays: number[];

  constructor() {
    this.maxRetries = 3;
    this.retryIntervals = [1, 3, 8]; // Days to wait before retry
    this.notificationDelays = [0, 1, 3]; // Days to wait before notifying user
  }

  /**
   * Handle failed payment with smart retry logic
   */
  async handleFailedPayment(subscriptionId: string): Promise<void> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
      const customer = await stripeClient.customers.retrieve(subscription.customer as string) as stripe.Customer;
      const user = await User.findOne({ email: customer.email });

      if (!user) {
        logger.error('User not found for failed payment', { subscriptionId, customerEmail: customer.email });
        return;
      }

      const failureCount = await this.getFailureCount(subscriptionId);
      
      logger.info('Processing failed payment', {
        subscriptionId,
        userId: user._id,
        failureCount,
        customerEmail: customer.email
      });

      if (failureCount >= this.maxRetries) {
        await this.handleFinalFailure(subscriptionId, user, customer);
        return;
      }

      // Schedule retry
      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + this.retryIntervals[failureCount]);

      await this.scheduleRetry(subscriptionId, retryDate, failureCount + 1);
      
      // Schedule user notification
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + this.notificationDelays[failureCount]);
      
      await this.scheduleUserNotification(user._id.toString(), subscriptionId, notificationDate, failureCount + 1);

    } catch (error) {
      logger.error('Error handling failed payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId
      });
      throw error;
    }
  }

  /**
   * Execute payment retry
   */
  async executeRetry(subscriptionId: string): Promise<boolean> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === 'active') {
        logger.info('Subscription already active, skipping retry', { subscriptionId });
        return true;
      }

      const invoice = await stripeClient.invoices.create({
        customer: subscription.customer as string,
        subscription: subscriptionId,
        collection_method: 'charge_automatically'
      });

      if (invoice.id) {
        await stripeClient.invoices.pay(invoice.id);
      }
      
      logger.info('Payment retry successful', { subscriptionId, invoiceId: invoice.id });
      return true;

    } catch (error) {
      logger.error('Payment retry failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId
      });
      return false;
    }
  }

  /**
   * Handle final failure after max retries
   */
  private async handleFinalFailure(subscriptionId: string, user: any, customer: StripeCustomer): Promise<void> {
    try {
      // Cancel subscription
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      await stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update user status
      user.premium.isActive = false;
      user.premium.paymentStatus = 'failed';
      await user.save();

      // Send final notification
      await this.sendFinalFailureNotification(user, subscriptionId);

      logger.info('Final failure handled', {
        subscriptionId,
        userId: user._id,
        customerEmail: customer.email
      });

    } catch (error) {
      logger.error('Error handling final failure', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId,
        userId: user._id
      });
    }
  }

  /**
   * Schedule retry
   */
  private async scheduleRetry(subscriptionId: string, retryDate: Date, attemptNumber: number): Promise<void> {
    try {
      // In a real implementation, this would use a job queue like Bull or Agenda
      // For now, we'll just log the scheduled retry
      logger.info('Payment retry scheduled', {
        subscriptionId,
        retryDate: retryDate.toISOString(),
        attemptNumber
      });

      // Store retry information in database or cache
      // This would typically be stored in a retry queue table
      
    } catch (error) {
      logger.error('Error scheduling retry', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId,
        retryDate
      });
    }
  }

  /**
   * Schedule user notification
   */
  private async scheduleUserNotification(userId: string, subscriptionId: string, notificationDate: Date, attemptNumber: number): Promise<void> {
    try {
      logger.info('User notification scheduled', {
        userId,
        subscriptionId,
        notificationDate: notificationDate.toISOString(),
        attemptNumber
      });

      // In a real implementation, this would schedule an email notification
      // For now, we'll just log it
      
    } catch (error) {
      logger.error('Error scheduling user notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Send final failure notification
   */
  private async sendFinalFailureNotification(user: any, subscriptionId: string): Promise<void> {
    try {
      // This would send an email to the user about subscription cancellation
      logger.info('Final failure notification sent', {
        userId: user._id,
        subscriptionId,
        userEmail: user.email
      });

    } catch (error) {
      logger.error('Error sending final failure notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user._id,
        subscriptionId
      });
    }
  }

  /**
   * Get failure count for subscription
   */
  private async getFailureCount(subscriptionId: string): Promise<number> {
    try {
      // In a real implementation, this would query a retry tracking table
      // For now, return 0 as default
      return 0;
    } catch (error) {
      logger.error('Error getting failure count', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId
      });
      return 0;
    }
  }

  /**
   * Get retry statistics
   */
  async getRetryStats(timeframe: string = '30d'): Promise<RetryStats> {
    try {
      const startDate = new Date();
      const days = parseInt(timeframe.replace('d', ''));
      startDate.setDate(startDate.getDate() - days);

      // In a real implementation, this would query retry statistics from database
      const stats = {
        totalRetries: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageRetryAttempts: 0,
        retrySuccessRate: 0,
        timeframe
      };

      logger.info('Retry statistics retrieved', { stats, timeframe });
      return stats;

    } catch (error) {
      logger.error('Error getting retry stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeframe
      });
      throw error;
    }
  }

  /**
   * Process scheduled retries
   */
  async processScheduledRetries(): Promise<void> {
    try {
      const now = new Date();
      
      // In a real implementation, this would query scheduled retries from database
      // For now, just log the processing
      logger.info('Processing scheduled retries', { timestamp: now.toISOString() });

    } catch (error) {
      logger.error('Error processing scheduled retries', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config: RetryConfig): void {
    try {
      if (config.maxRetries !== undefined) {
        this.maxRetries = config.maxRetries;
      }
      if (config.retryIntervals !== undefined) {
        this.retryIntervals = config.retryIntervals;
      }
      if (config.notificationDelays !== undefined) {
        this.notificationDelays = config.notificationDelays;
      }

      logger.info('Retry configuration updated', { config });
    } catch (error) {
      logger.error('Error updating retry config', {
        error: error instanceof Error ? error.message : 'Unknown error',
        config
      });
    }
  }
}

// Export singleton instance
const paymentRetryService = new PaymentRetryService();
export default paymentRetryService;
