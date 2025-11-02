export {};// Added to mark file as a module
/**
 * Smart Payment Retry Service for PawfectMatch
 * Intelligent retry logic for failed payments with exponential backoff
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const logger = require('../utils/logger');

class PaymentRetryService {
  constructor() {
    this.maxRetries = 3;
    this.retryIntervals = [1, 3, 8]; // Days to wait before retry
    this.notificationDelays = [0, 1, 3]; // Days to wait before notifying user
  }

  /**
   * Handle failed payment with smart retry logic
   */
  async handleFailedPayment(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customer = await stripe.customers.retrieve(subscription.customer);
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
      
      // Schedule notification
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + this.notificationDelays[failureCount]);
      
      await this.scheduleNotification(user, notificationDate, failureCount + 1, retryDate);

      logger.info('Payment retry scheduled', {
        subscriptionId,
        userId: user._id,
        retryDate: retryDate.toISOString(),
        failureCount: failureCount + 1
      });

    } catch (error) {
      logger.error('Error handling failed payment', {
        subscriptionId,
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Execute scheduled retry
   */
  async executeRetry(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      if (subscription.status === 'active') {
        logger.info('Subscription already active, skipping retry', { subscriptionId });
        return;
      }

      // Attempt to collect payment
      const invoice = await stripe.invoices.create({
        customer: subscription.customer,
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
      logger.error('Error executing payment retry', {
        subscriptionId,
        error: error.message
      });

      // Increment failure count and schedule next retry
      await this.incrementFailureCount(subscriptionId);
      await this.handleFailedPayment(subscriptionId);
    }
  }

  /**
   * Handle successful retry
   */
  async handleSuccessfulRetry(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customer = await stripe.customers.retrieve(subscription.customer);
      const user = await User.findOne({ email: customer.email });

      if (user) {
        // Update user subscription status
        user.premium.isActive = true;
        user.premium.stripeSubscriptionId = subscriptionId;
        user.premium.retryCount = 0;
        await user.save();

        // Clear any scheduled retries
        await this.clearScheduledRetries(subscriptionId);

        // Send success notification
        await this.sendSuccessNotification(user);

        logger.info('Subscription reactivated successfully', {
          subscriptionId,
          userId: user._id
        });
      }
    } catch (error) {
      logger.error('Error handling successful retry', {
        subscriptionId,
        error: error.message
      });
    }
  }

  /**
   * Handle final failure after max retries
   */
  async handleFinalFailure(subscriptionId, user, customer) {
    try {
      // Cancel subscription
      await stripe.subscriptions.cancel(subscriptionId);

      // Update user status
      user.premium.isActive = false;
      user.premium.stripeSubscriptionId = null;
      user.premium.cancellationReason = 'payment_failed';
      user.premium.cancelledAt = new Date();
      await user.save();

      // Send final failure notification
      await this.sendFinalFailureNotification(user, customer);

      // Clear scheduled retries
      await this.clearScheduledRetries(subscriptionId);

      logger.info('Subscription cancelled due to payment failures', {
        subscriptionId,
        userId: user._id,
        customerEmail: customer.email
      });

    } catch (error) {
      logger.error('Error handling final failure', {
        subscriptionId,
        userId: user._id,
        error: error.message
      });
    }
  }

  /**
   * Schedule retry for later execution
   */
  async scheduleRetry(subscriptionId, retryDate, attemptNumber) {
    // Use Bull job queue for real implementation
    const Queue = require('bull');
    const retryQueue = new Queue('payment retry', process.env.REDIS_URL || 'redis://localhost:6379');
    
    const retryJob = {
      subscriptionId,
      retryDate,
      attemptNumber,
      status: 'scheduled',
      createdAt: new Date()
    };

    // Store in database with MongoDB
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    await client.connect();
    
    const db = client.db();
    const retryJobs = db.collection('retryJobs');
    
    await retryJobs.insertOne(retryJob);
    await client.close();
    
    // Schedule job in Bull queue
    await retryQueue.add('process-retry', {
      subscriptionId,
      attemptNumber
    }, {
      delay: retryDate.getTime() - Date.now()
    });
    
    logger.info('Retry job scheduled', retryJob);
  }

  /**
   * Schedule user notification
   */
  async scheduleNotification(user, notificationDate, attemptNumber, retryDate) {
    const notification = {
      userId: user._id,
      type: 'payment_retry_scheduled',
      scheduledDate: notificationDate,
      data: {
        attemptNumber,
        retryDate: retryDate.toISOString(),
        subscriptionId: user.premium.stripeSubscriptionId
      },
      status: 'scheduled',
      createdAt: new Date()
    };

    // Store in database with MongoDB
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
    await client.connect();
    
    const db = client.db();
    const notifications = db.collection('notifications');
    
    await notifications.insertOne(notification);
    await client.close();
    
    logger.info('Notification scheduled', notification);
  }

  /**
   * Get failure count for subscription
   */
  async getFailureCount(subscriptionId) {
    // Query database for failure count
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const failureCounts = db.collection('failureCounts');
      
      const result = await failureCounts.findOne({ subscriptionId });
      await client.close();
      
      return result ? result.count : 0;
    } catch (error) {
      logger.error('Error getting failure count', { subscriptionId, error: error.message });
      return 0;
    }
  }

  /**
   * Increment failure count
   */
  async incrementFailureCount(subscriptionId) {
    // Update database record for failure count
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const failureCounts = db.collection('failureCounts');
      
      await failureCounts.updateOne(
        { subscriptionId },
        { 
          $inc: { count: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
      
      await client.close();
      logger.info('Failure count incremented', { subscriptionId });
    } catch (error) {
      logger.error('Error incrementing failure count', { subscriptionId, error: error.message });
    }
  }

  /**
   * Clear scheduled retries
   */
  async clearScheduledRetries(subscriptionId) {
    // Cancel jobs in the Bull queue
    try {
      const Queue = require('bull');
      const retryQueue = new Queue('payment retry', process.env.REDIS_URL || 'redis://localhost:6379');
      
      // Remove all jobs for this subscription
      const jobs = await retryQueue.getJobs(['waiting', 'delayed']);
      for (const job of jobs) {
        if (job.data.subscriptionId === subscriptionId) {
          await job.remove();
        }
      }
      
      // Also remove from database
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const retryJobs = db.collection('retryJobs');
      
      await retryJobs.deleteMany({ subscriptionId });
      await client.close();
      
      logger.info('Scheduled retries cleared', { subscriptionId });
    } catch (error) {
      logger.error('Error clearing scheduled retries', { subscriptionId, error: error.message });
    }
  }

  /**
   * Send success notification
   */
  async sendSuccessNotification(user) {
    // Send email/push notification with real implementation
    try {
      // Send email notification
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
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
          tokens: user.pushTokens
        };
        
        await admin.messaging().sendMulticast(message);
      }

      logger.info('Success notification sent', { userId: user._id });
    } catch (error) {
      logger.error('Error sending success notification', { userId: user._id, error: error.message });
    }
  }

  /**
   * Send final failure notification
   */
  async sendFinalFailureNotification(user, customer) {
    // Send email/push notification with real implementation
    try {
      // Send email notification
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: 'Payment Failed - PawfectMatch Premium',
        html: `
          <h2>Payment Failed</h2>
          <p>We were unable to process your premium subscription payment after multiple attempts.</p>
          <p>Please update your payment method to continue your premium membership.</p>
          <a href="${process.env.FRONTEND_URL}/premium/manage">Update Payment Method</a>
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
          tokens: user.pushTokens
        };
        
        await admin.messaging().sendMulticast(message);
      }

      logger.info('Final failure notification sent', { 
        userId: user._id, 
        customerEmail: customer.email 
      });
    } catch (error) {
      logger.error('Error sending final failure notification', { 
        userId: user._id, 
        customerEmail: customer.email,
        error: error.message 
      });
    }
  }

  /**
   * Process scheduled retries (called by cron job)
   */
  async processScheduledRetries() {
    try {
      const now = new Date();
      
      // Query scheduled jobs from database
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const retryJobs = db.collection('retryJobs');
      
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

      await client.close();
      logger.info('Processed scheduled retries', { 
        processedAt: now.toISOString(),
        count: scheduledRetries.length 
      });
    } catch (error) {
      logger.error('Error processing scheduled retries', { error: error.message });
    }
  }

  /**
   * Process scheduled notifications (called by cron job)
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      // Query scheduled notifications from database
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const notifications = db.collection('notifications');
      
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

      await client.close();
      logger.info('Processed scheduled notifications', { 
        processedAt: now.toISOString(),
        count: scheduledNotifications.length 
      });
    } catch (error) {
      logger.error('Error processing scheduled notifications', { error: error.message });
    }
  }

  /**
   * Get retry statistics
   */
  async getRetryStatistics() {
    try {
      // Query database for statistics
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawfectmatch');
      await client.connect();
      
      const db = client.db();
      const retryJobs = db.collection('retryJobs');
      
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
        ? completedRetries.reduce((sum, retry) => {
            const retryTime = retry.completedAt.getTime() - retry.createdAt.getTime();
            return sum + retryTime;
          }, 0) / completedRetries.length
        : 0;
      
      const retrySuccessRate = totalRetries > 0 ? (successfulRetries / totalRetries) * 100 : 0;
      
      await client.close();
      
      return {
        totalRetries,
        successfulRetries,
        failedRetries,
        averageRetryTime,
        retrySuccessRate
      };
    } catch (error) {
      logger.error('Error getting retry statistics', { error: error.message });
      return null;
    }
  }
}

module.exports = new PaymentRetryService();
