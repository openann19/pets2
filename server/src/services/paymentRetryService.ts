/**
 * Smart Payment Retry Service for PawfectMatch
 * Intelligent retry logic for failed payments with exponential backoff
 */

import Stripe from 'stripe';
import Queue from 'bull';
import { MongoClient, type Db, type Collection } from 'mongodb';
import User from '../models/User';
import type { IUserDocument } from '../models/User';
import type { HydratedDocument } from 'mongoose';
const logger = require('../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Type definitions
interface RetryJob {
  subscriptionId: string;
  retryDate: Date;
  attemptNumber: number;
  status: 'scheduled' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

interface Notification {
  userId: string;
  type: 'payment_retry_scheduled';
  scheduledDate: Date;
  data: {
    attemptNumber: number;
    retryDate: string;
    subscriptionId: string | null;
  };
  status: 'scheduled' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}

interface FailureCount {
  subscriptionId: string;
  count: number;
  lastUpdated: Date;
}

interface RetryStatistics {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  averageRetryTime: number;
  retrySuccessRate: number;
}

class PaymentRetryService {
  private readonly maxRetries: number;
  private readonly retryIntervals: number[];
  private readonly notificationDelays: number[];
  private retryQueue: Queue.Queue | null = null;

  constructor() {
    this.maxRetries = 3;
    this.retryIntervals = [1, 3, 8]; // Days to wait before retry
    this.notificationDelays = [0, 1, 3]; // Days to wait before notifying user
    
    // Initialize Bull queue
    if (process.env.REDIS_URL) {
      this.retryQueue = new Queue('payment retry', process.env.REDIS_URL);
    }
  }

  /**
   * Handle failed payment with smart retry logic
   */
  async handleFailedPayment(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (customer.deleted || !customer.email) {
        logger.error('Invalid customer for failed payment', { subscriptionId });
        return;
      }
      
      const customerEmail = typeof customer.email === 'string' ? customer.email : null;
      if (!customerEmail) {
        logger.error('Customer email is not a string', { subscriptionId });
        return;
      }
      const user = await User.findOne({ email: customerEmail });

      if (!user) {
        logger.error('User not found for failed payment', { subscriptionId, customerEmail: customer.email });
        return;
      }

      const userDoc = user as unknown as HydratedDocument<IUserDocument>;
      const failureCount = await this.getFailureCount(subscriptionId);
      
      logger.info('Processing failed payment', {
        subscriptionId,
        userId: (userDoc._id as unknown as { toString(): string }).toString(),
        failureCount,
        customerEmail: customer.email
      });

      if (failureCount >= this.maxRetries) {
        await this.handleFinalFailure(subscriptionId, userDoc, customer);
        return;
      }

      // Schedule retry
      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + this.retryIntervals[failureCount]);

      await this.scheduleRetry(subscriptionId, retryDate, failureCount + 1);
      
      // Schedule notification
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + this.notificationDelays[failureCount]);
      
      await this.scheduleNotification(userDoc, notificationDate, failureCount + 1, retryDate);

      logger.info('Payment retry scheduled', {
        subscriptionId,
        userId: (userDoc._id as unknown as { toString(): string }).toString(),
        retryDate: retryDate.toISOString(),
        failureCount: failureCount + 1
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling failed payment', {
        subscriptionId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Execute scheduled retry
   */
  async executeRetry(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === 'active') {
        logger.info('Subscription already active, skipping retry', { subscriptionId });
        return;
      }

      // Attempt to collect payment
      const invoice = await stripe.invoices.create({
        customer: subscription.customer as string,
        subscription: subscriptionId,
        collection_method: 'charge_automatically'
      });

      const paidInvoice = await stripe.invoices.pay(invoice.id);

      if (paidInvoice.status === 'paid') {
        await this.handleSuccessfulRetry(subscriptionId);
        logger.info('Payment retry successful', { subscriptionId });
      } else {
        // Payment still failed, increment failure count
        await this.incrementFailureCount(subscriptionId);
        await this.handleFailedPayment(subscriptionId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error executing payment retry', {
        subscriptionId,
        error: errorMessage
      });

      // Increment failure count and schedule next retry
      await this.incrementFailureCount(subscriptionId);
      await this.handleFailedPayment(subscriptionId);
    }
  }

  /**
   * Handle successful retry
   */
  private async handleSuccessfulRetry(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (customer.deleted || !customer.email) {
        logger.error('Invalid customer for successful retry', { subscriptionId });
        return;
      }
      
      const customerEmail = typeof customer.email === 'string' ? customer.email : null;
      if (!customerEmail) {
        logger.error('Customer email is not a string', { subscriptionId });
        return;
      }
      const user = await User.findOne({ email: customerEmail });

      if (user) {
        const userDoc = user as unknown as HydratedDocument<IUserDocument>;
        // Update user subscription status
        userDoc.premium.isActive = true;
        userDoc.premium.stripeSubscriptionId = subscriptionId;
        if ('retryCount' in userDoc.premium) {
          (userDoc.premium as { retryCount?: number }).retryCount = 0;
        }
        await userDoc.save();

        // Clear any scheduled retries
        await this.clearScheduledRetries(subscriptionId);

        // Send success notification
        await this.sendSuccessNotification(userDoc);

        logger.info('Subscription reactivated successfully', {
          subscriptionId,
          userId: (userDoc._id as unknown as { toString(): string }).toString()
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling successful retry', {
        subscriptionId,
        error: errorMessage
      });
    }
  }

  /**
   * Handle final failure after max retries
   */
  private async handleFinalFailure(subscriptionId: string, user: HydratedDocument<IUserDocument>, customer: Stripe.Customer | Stripe.DeletedCustomer): Promise<void> {
    try {
      // Cancel subscription
      await stripe.subscriptions.cancel(subscriptionId);

      // Update user status
      const userDoc = user as unknown as HydratedDocument<IUserDocument>;
      userDoc.premium.isActive = false;
      userDoc.premium.stripeSubscriptionId = undefined;
      if ('cancellationReason' in userDoc.premium) {
        (userDoc.premium as { cancellationReason?: string }).cancellationReason = 'payment_failed';
      }
      if ('cancelledAt' in userDoc.premium) {
        (userDoc.premium as { cancelledAt?: Date }).cancelledAt = new Date();
      }
      await userDoc.save();

      // Send final failure notification
      await this.sendFinalFailureNotification(userDoc, customer);

      // Clear scheduled retries
      await this.clearScheduledRetries(subscriptionId);

      logger.info('Subscription cancelled due to payment failures', {
        subscriptionId,
        userId: (userDoc._id as unknown as { toString(): string }).toString(),
        customerEmail: customer.deleted ? undefined : (typeof customer.email === 'string' ? customer.email : customer.email)
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling final failure', {
        subscriptionId,
        userId: (userDoc._id as unknown as { toString(): string }).toString(),
        error: errorMessage
      });
    }
  }

  /**
   * Schedule retry for later execution
   */
  private async scheduleRetry(subscriptionId: string, retryDate: Date, attemptNumber: number): Promise<void> {
    // Use Bull job queue for real implementation
    if (!this.retryQueue) {
      logger.warn('Retry queue not initialized, skipping job scheduling');
      return;
    }

    const retryJob: RetryJob = {
      subscriptionId,
      retryDate,
      attemptNumber,
      status: 'scheduled',
      createdAt: new Date()
    };

    // Store in database with MongoDB
    const client = await this.getMongoClient();
    try {
      const db: Db = client.db();
      const retryJobs: Collection<RetryJob> = db.collection<RetryJob>('retryJobs');
      
      await retryJobs.insertOne(retryJob);
      
      // Schedule job in Bull queue
      await this.retryQueue.add('process-retry', {
        subscriptionId,
        attemptNumber
      }, {
        delay: retryDate.getTime() - Date.now()
      });
      
      logger.info('Retry job scheduled', retryJob);
    } finally {
      await client.close();
    }
  }

  /**
   * Schedule user notification
   */
  private async scheduleNotification(user: HydratedDocument<IUserDocument>, notificationDate: Date, attemptNumber: number, retryDate: Date): Promise<void> {
    const notification: Notification = {
      userId: (user._id as unknown as { toString(): string }).toString(),
      type: 'payment_retry_scheduled',
      scheduledDate: notificationDate,
      data: {
        attemptNumber,
        retryDate: retryDate.toISOString(),
        subscriptionId: user.premium?.stripeSubscriptionId || null
      },
      status: 'scheduled',
      createdAt: new Date()
    };

    // Store in database with MongoDB
    const client = await this.getMongoClient();
    try {
      const db: Db = client.db();
      const notifications: Collection<Notification> = db.collection<Notification>('notifications');
      
      await notifications.insertOne(notification);
      logger.info('Notification scheduled', notification);
    } finally {
      await client.close();
    }
  }

  /**
   * Get failure count for subscription
   */
  private async getFailureCount(subscriptionId: string): Promise<number> {
    // Query database for failure count
    try {
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const failureCounts: Collection<FailureCount> = db.collection<FailureCount>('failureCounts');
        
        const result = await failureCounts.findOne({ subscriptionId });
        
        return result ? result.count : 0;
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting failure count', { subscriptionId, error: errorMessage });
      return 0;
    }
  }

  /**
   * Increment failure count
   */
  private async incrementFailureCount(subscriptionId: string): Promise<void> {
    // Update database record for failure count
    try {
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const failureCounts: Collection<FailureCount> = db.collection<FailureCount>('failureCounts');
        
        await failureCounts.updateOne(
          { subscriptionId },
          { 
            $inc: { count: 1 },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true }
        );
        
        logger.info('Failure count incremented', { subscriptionId });
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error incrementing failure count', { subscriptionId, error: errorMessage });
    }
  }

  /**
   * Clear scheduled retries
   */
  private async clearScheduledRetries(subscriptionId: string): Promise<void> {
    // Cancel jobs in the Bull queue
    try {
      if (this.retryQueue) {
        // Remove all jobs for this subscription
        const jobs = await this.retryQueue.getJobs(['waiting', 'delayed']);
        for (const job of jobs) {
          if (job.data.subscriptionId === subscriptionId) {
            await job.remove();
          }
        }
      }
      
      // Also remove from database
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const retryJobs: Collection<RetryJob> = db.collection<RetryJob>('retryJobs');
        
        await retryJobs.deleteMany({ subscriptionId });
        
        logger.info('Scheduled retries cleared', { subscriptionId });
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error clearing scheduled retries', { subscriptionId, error: errorMessage });
    }
  }

  /**
   * Send success notification
   */
  private async sendSuccessNotification(user: HydratedDocument<IUserDocument>): Promise<void> {
    // Send email/push notification with real implementation
    try {
      // Import email service
      const emailService = require('./emailService').default;
      
      await emailService.sendEmail({
        to: user.email,
        subject: 'Payment Successful - PawfectMatch Premium',
        html: `
          <h2>Payment Successful!</h2>
          <p>Your premium subscription payment has been processed successfully.</p>
          <p>Thank you for being a premium member!</p>
        `
      });

      // Send push notification if user has push tokens
      if (user.pushTokens && user.pushTokens.length > 0) {
        const admin = require('firebase-admin');
        const message = {
          notification: {
            title: 'Payment Successful',
            body: 'Your premium subscription payment has been processed successfully.'
          },
          tokens: user.pushTokens.map(token => token.token)
        };
        
        await admin.messaging().sendMulticast(message);
      }

      logger.info('Success notification sent', { userId: (user._id as unknown as { toString(): string }).toString() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending success notification', { userId: (user._id as unknown as { toString(): string }).toString(), error: errorMessage });
    }
  }

  /**
   * Send final failure notification
   */
  private async sendFinalFailureNotification(user: HydratedDocument<IUserDocument>, customer: Stripe.Customer | Stripe.DeletedCustomer): Promise<void> {
    // Send email/push notification with real implementation
    try {
      // Import email service
      const emailService = require('./emailService').default;
      
      const customerEmail = customer.deleted ? user.email : (typeof customer.email === 'string' ? customer.email : customer.email || user.email);
      
      await emailService.sendEmail({
        to: customerEmail,
        subject: 'Payment Failed - PawfectMatch Premium',
        html: `
          <h2>Payment Failed</h2>
          <p>We were unable to process your premium subscription payment after multiple attempts.</p>
          <p>Please update your payment method to continue your premium membership.</p>
          <a href="${process.env.CLIENT_URL}/premium/manage">Update Payment Method</a>
        `
      });

      // Send push notification if user has push tokens
      if (user.pushTokens && user.pushTokens.length > 0) {
        const admin = require('firebase-admin');
        const message = {
          notification: {
            title: 'Payment Failed',
            body: 'Please update your payment method to continue your premium membership.'
          },
          tokens: user.pushTokens.map(token => token.token)
        };
        
        await admin.messaging().sendMulticast(message);
      }

      logger.info('Final failure notification sent', { 
        userId: (user._id as unknown as { toString(): string }).toString(), 
        customerEmail: customerEmail
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending final failure notification', { 
        userId: (user._id as unknown as { toString(): string }).toString(), 
        customerEmail: customer.deleted ? user.email : (typeof customer.email === 'string' ? customer.email : customer.email),
        error: errorMessage 
      });
    }
  }

  /**
   * Process scheduled retries (called by cron job)
   */
  async processScheduledRetries(): Promise<void> {
    try {
      const now = new Date();
      
      // Query scheduled jobs from database
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const retryJobs: Collection<RetryJob> = db.collection<RetryJob>('retryJobs');
        
        const scheduledRetries = await retryJobs.find({
          status: 'scheduled',
          retryDate: { $lte: now }
        }).toArray();

        for (const retry of scheduledRetries) {
          await this.executeRetry(retry.subscriptionId);
          await retryJobs.updateOne(
            { _id: retry._id },
            { $set: { status: 'completed', completedAt: new Date() } }
          );
        }

        logger.info('Processed scheduled retries', { 
          processedAt: now.toISOString(),
          count: scheduledRetries.length 
        });
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing scheduled retries', { error: errorMessage });
    }
  }

  /**
   * Process scheduled notifications (called by cron job)
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      
      // Query scheduled notifications from database
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const notifications: Collection<Notification> = db.collection<Notification>('notifications');
        
        const scheduledNotifications = await notifications.find({
          status: 'scheduled',
          scheduledDate: { $lte: now }
        }).toArray();

        for (const notification of scheduledNotifications) {
          await this.sendNotification(notification);
          await notifications.updateOne(
            { _id: notification._id },
            { $set: { status: 'sent', sentAt: new Date() } }
          );
        }

        logger.info('Processed scheduled notifications', { 
          processedAt: now.toISOString(),
          count: scheduledNotifications.length 
        });
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing scheduled notifications', { error: errorMessage });
    }
  }

  /**
   * Send notification (helper method)
   */
  private async sendNotification(notification: Notification): Promise<void> {
    // Implementation for sending notification
    logger.info('Sending notification', { notificationId: (notification as Notification & { _id?: unknown })._id });
  }

  /**
   * Get retry statistics
   */
  async getRetryStatistics(): Promise<RetryStatistics | null> {
    try {
      // Query database for statistics
      const client = await this.getMongoClient();
      try {
        const db: Db = client.db();
        const retryJobs: Collection<RetryJob> = db.collection<RetryJob>('retryJobs');
        
        const totalRetries = await retryJobs.countDocuments();
        const successfulRetries = await retryJobs.countDocuments({ status: 'completed' });
        const failedRetries = await retryJobs.countDocuments({ status: 'failed' });
        
        // Calculate average retry time
        const completedRetries = await retryJobs.find({ 
          status: 'completed',
          completedAt: { $exists: true },
          createdAt: { $exists: true }
        }).toArray();
        
        const averageRetryTime = completedRetries.length > 0 
          ? completedRetries.reduce((sum: number, retry: RetryJob) => {
              const completedAt = retry.completedAt!;
              const createdAt = retry.createdAt;
              const retryTime = completedAt.getTime() - createdAt.getTime();
              return sum + retryTime;
            }, 0) / completedRetries.length
          : 0;
        
        const retrySuccessRate = totalRetries > 0 ? (successfulRetries / totalRetries) * 100 : 0;
        
        return {
          totalRetries,
          successfulRetries,
          failedRetries,
          averageRetryTime,
          retrySuccessRate
        };
      } finally {
        await client.close();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting retry statistics', { error: errorMessage });
      return null;
    }
  }

  /**
   * Get MongoDB client
   */
  private async getMongoClient(): Promise<MongoClient> {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    await client.connect();
    return client;
  }
}

export default new PaymentRetryService();
