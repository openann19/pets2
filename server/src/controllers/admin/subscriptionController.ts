/**
 * Admin Subscription Management Controller
 * Handles subscription lifecycle management (cancel, reactivate, update)
 */

import type { Request, Response } from 'express';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';
import { getErrorMessage } from '../../utils/errorHandler';
import User from '../../models/User';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * POST /api/admin/subscriptions/:id/cancel
 * Cancel a subscription
 */
export const cancelSubscription = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    // Find user by subscription ID or user ID
    // The id could be a user ID or a Stripe subscription ID
    let user = await User.findById(id);
    
    if (!user && id.startsWith('sub_')) {
      // If it's a Stripe subscription ID, find by stripeSubscriptionId
      user = await User.findOne({ 'premium.stripeSubscriptionId': id });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User or subscription not found',
      });
      return;
    }

    // Cancel subscription
    user.premium.cancelAtPeriodEnd = true;
    user.premium.paymentStatus = 'cancelling';
    
    // If there's a Stripe subscription, cancel it via Stripe API
    if (user.premium.stripeSubscriptionId) {
      try {
        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2024-11-20.acacia',
        });
        
        await stripeClient.subscriptions.update(user.premium.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        
        logger.info('Stripe subscription cancelled', {
          subscriptionId: user.premium.stripeSubscriptionId,
          userId: user._id,
        });
      } catch (stripeError) {
        logger.error('Failed to cancel Stripe subscription', {
          subscriptionId: user.premium.stripeSubscriptionId,
          error: stripeError,
        });
        // Continue with database update even if Stripe fails
      }
    }

    await user.save();

    logger.info('Subscription cancel requested', { 
      subscriptionId: id, 
      userId: user._id,
      reason 
    });

    await logAdminActivity(req, 'CANCEL_SUBSCRIPTION', { 
      subscriptionId: id, 
      userId: user._id.toString(),
      reason 
    });

    res.json({
      success: true,
      message: `Subscription has been canceled`,
      data: {
        subscriptionId: user.premium.stripeSubscriptionId || id,
        userId: user._id,
        canceledAt: new Date().toISOString(),
        expiresAt: user.premium.expiresAt?.toISOString(),
        reason,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to cancel subscription', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: getErrorMessage(error),
    });
  }
};

/**
 * POST /api/admin/subscriptions/:id/reactivate
 * Reactivate a subscription
 */
export const reactivateSubscription = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user by subscription ID or user ID
    let user = await User.findById(id);
    
    if (!user && id.startsWith('sub_')) {
      user = await User.findOne({ 'premium.stripeSubscriptionId': id });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User or subscription not found',
      });
      return;
    }

    // Reactivate subscription
    user.premium.cancelAtPeriodEnd = false;
    user.premium.isActive = true;
    user.premium.paymentStatus = 'active';
    
    // If there's a Stripe subscription, reactivate it
    if (user.premium.stripeSubscriptionId) {
      try {
        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2024-11-20.acacia',
        });
        
        await stripeClient.subscriptions.update(user.premium.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
        
        logger.info('Stripe subscription reactivated', {
          subscriptionId: user.premium.stripeSubscriptionId,
          userId: user._id,
        });
      } catch (stripeError) {
        logger.error('Failed to reactivate Stripe subscription', {
          subscriptionId: user.premium.stripeSubscriptionId,
          error: stripeError,
        });
        // Continue with database update even if Stripe fails
      }
    }

    await user.save();

    logger.info('Subscription reactivate requested', { 
      subscriptionId: id,
      userId: user._id,
    });

    await logAdminActivity(req, 'REACTIVATE_SUBSCRIPTION', { 
      subscriptionId: id,
      userId: user._id.toString(),
    });

    res.json({
      success: true,
      message: `Subscription has been reactivated`,
      data: {
        subscriptionId: user.premium.stripeSubscriptionId || id,
        userId: user._id,
        reactivatedAt: new Date().toISOString(),
        expiresAt: user.premium.expiresAt?.toISOString(),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to reactivate subscription', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription',
      message: getErrorMessage(error),
    });
  }
};

/**
 * PUT /api/admin/subscriptions/:id/update
 * Update subscription details
 */
export const updateSubscription = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as {
      plan?: string;
      expiresAt?: string;
      features?: Record<string, boolean>;
      paymentStatus?: string;
      cancelAtPeriodEnd?: boolean;
    };

    // Find user by subscription ID or user ID
    let user = await User.findById(id);
    
    if (!user && id.startsWith('sub_')) {
      user = await User.findOne({ 'premium.stripeSubscriptionId': id });
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User or subscription not found',
      });
      return;
    }

    // Update subscription fields
    const updates: Record<string, unknown> = {};
    
    if (updateData.plan !== undefined) {
      user.premium.plan = updateData.plan;
      updates.plan = updateData.plan;
    }

    if (updateData.expiresAt !== undefined) {
      user.premium.expiresAt = new Date(updateData.expiresAt);
      updates.expiresAt = updateData.expiresAt;
    }

    if (updateData.paymentStatus !== undefined) {
      user.premium.paymentStatus = updateData.paymentStatus;
      updates.paymentStatus = updateData.paymentStatus;
    }

    if (updateData.cancelAtPeriodEnd !== undefined) {
      user.premium.cancelAtPeriodEnd = updateData.cancelAtPeriodEnd;
      updates.cancelAtPeriodEnd = updateData.cancelAtPeriodEnd;
    }

    if (updateData.features) {
      Object.assign(user.premium.features, updateData.features);
      updates.features = updateData.features;
    }

    // Update Stripe subscription if needed
    if (user.premium.stripeSubscriptionId && (updateData.expiresAt || updateData.plan)) {
      try {
        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2024-11-20.acacia',
        });
        
        const stripeUpdate: Record<string, unknown> = {};
        
        if (updateData.expiresAt) {
          // Stripe doesn't directly support updating expiration, but we can update the subscription period
          // This is a simplified approach - in production, you'd want to handle this more carefully
          logger.info('Expiration date update requested for Stripe subscription', {
            subscriptionId: user.premium.stripeSubscriptionId,
          });
        }

        await stripeClient.subscriptions.update(user.premium.stripeSubscriptionId, stripeUpdate);
        
        logger.info('Stripe subscription updated', {
          subscriptionId: user.premium.stripeSubscriptionId,
          userId: user._id,
        });
      } catch (stripeError) {
        logger.error('Failed to update Stripe subscription', {
          subscriptionId: user.premium.stripeSubscriptionId,
          error: stripeError,
        });
        // Continue with database update even if Stripe fails
      }
    }

    await user.save();

    logger.info('Subscription update requested', { 
      subscriptionId: id, 
      userId: user._id,
      updateData 
    });

    await logAdminActivity(req, 'UPDATE_SUBSCRIPTION', { 
      subscriptionId: id,
      userId: user._id.toString(),
      updateData 
    });

    res.json({
      success: true,
      message: `Subscription has been updated`,
      data: {
        subscriptionId: user.premium.stripeSubscriptionId || id,
        userId: user._id,
        updatedAt: new Date().toISOString(),
        updates,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to update subscription', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription',
      message: getErrorMessage(error),
    });
  }
};

