import type { Request, Response } from "express";
import { Router } from "express";
import User from "../models/User";
import logger from "../utils/logger";

const r: Router = Router();

/**
 * RevenueCat Webhook Handler
 * Processes RevenueCat subscription events and updates user premium status
 * 
 * Supported events:
 * - INITIAL_PURCHASE: First-time subscription purchase
 * - RENEWAL: Subscription renewal
 * - UNCANCELLATION: User reactivated cancelled subscription
 * - CANCELLATION: User cancelled subscription
 * - EXPIRATION: Subscription expired
 */
r.post("/revenuecat/webhook", async (req: Request, res: Response) => {
  try {
    const { 
      event, 
      app_user_id, 
      entitlement_id,
      product_id,
      expiration_at_ms,
      purchased_at_ms
    } = req.body || {};
    
    // Validate required fields
    if (!app_user_id || !event) {
      logger.warn('RevenueCat webhook missing required fields', { 
        app_user_id, 
        event,
        body: req.body 
      });
      return res.status(400).json({ 
        error: "Missing required fields: app_user_id and event" 
      });
    }

    // Only process premium entitlement events
    if (entitlement_id === "pro" || product_id?.includes('premium')) {
      const isPremiumActive = 
        event === "INITIAL_PURCHASE" ||
        event === "RENEWAL" ||
        event === "UNCANCELLATION";

      // Find user by RevenueCat app_user_id (usually matches our userId or email)
      // Try to find by _id first, then by email if _id doesn't work
      let user = await User.findById(app_user_id);
      
      if (!user && app_user_id.includes('@')) {
        // If app_user_id is an email, search by email
        user = await User.findOne({ email: app_user_id });
      }

      if (!user) {
        logger.error('RevenueCat webhook: User not found', { 
          app_user_id,
          event,
          entitlement_id
        });
        return res.status(404).json({ 
          error: "User not found",
          app_user_id 
        });
      }

      // Calculate expiration date
      let expiresAt: Date | null = null;
      if (expiration_at_ms) {
        expiresAt = new Date(expiration_at_ms);
      } else if (purchased_at_ms) {
        // Default to 30 days from purchase if expiration not provided
        expiresAt = new Date(purchased_at_ms + (30 * 24 * 60 * 60 * 1000));
      }

      // Update user premium status based on event
      const updateData: {
        'premium.isActive': boolean;
        'premium.plan': string;
        'premium.expiresAt'?: Date | null;
        'premium.cancelAtPeriodEnd'?: boolean;
        'premium.paymentStatus': string;
        'premium.features.unlimitedLikes'?: boolean;
        'premium.features.boostProfile'?: boolean;
        'premium.features.seeWhoLiked'?: boolean;
        'premium.features.advancedFilters'?: boolean;
        'premium.features.aiMatching'?: boolean;
        'premium.features.prioritySupport'?: boolean;
      } = {
        'premium.isActive': isPremiumActive,
        'premium.plan': isPremiumActive ? 'premium' : 'free',
        'premium.paymentStatus': isPremiumActive ? 'active' : 'failed',
      };

      if (expiresAt) {
        updateData['premium.expiresAt'] = expiresAt;
      }

      if (event === 'CANCELLATION') {
        updateData['premium.cancelAtPeriodEnd'] = true;
        // Don't immediately deactivate, wait for expiration
        updateData['premium.isActive'] = true;
      } else if (event === 'EXPIRATION') {
        updateData['premium.isActive'] = false;
        updateData['premium.cancelAtPeriodEnd'] = false;
      } else if (isPremiumActive) {
        // Activate all premium features
        updateData['premium.features.unlimitedLikes'] = true;
        updateData['premium.features.boostProfile'] = true;
        updateData['premium.features.seeWhoLiked'] = true;
        updateData['premium.features.advancedFilters'] = true;
        updateData['premium.features.aiMatching'] = true;
        updateData['premium.features.prioritySupport'] = true;
        updateData['premium.cancelAtPeriodEnd'] = false;
      }

      await User.findByIdAndUpdate(user._id, { $set: updateData });

      logger.info('RevenueCat webhook processed', {
        userId: user._id,
        app_user_id,
        event,
        entitlement_id,
        isPremiumActive,
        expiresAt: expiresAt?.toISOString()
      });

      return res.json({ 
        ok: true,
        processed: true,
        userId: user._id,
        premiumActive: isPremiumActive
      });
    }

    // Event for non-premium entitlement or unknown event
    logger.debug('RevenueCat webhook: Skipping non-premium event', { 
      event, 
      entitlement_id,
      app_user_id 
    });
    
    return res.json({ ok: true, processed: false });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("RevenueCat webhook error", { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    
    // Return 200 to prevent RevenueCat from retrying invalid requests
    // but log the error for investigation
    return res.status(200).json({ 
      ok: false, 
      error: "Webhook processing failed",
      message: errorMessage
    });
  }
});

export default r;
