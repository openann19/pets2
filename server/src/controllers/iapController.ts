/**
 * IAP Controller for PawfectMatch
 * Handles in-app purchases, receipt validation, and balance management
 * Business Model: Microtransactions as per business.md
 */

import type { Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';
import { getErrorMessage } from '../../utils/errorHandler';
import { validateReceipt } from '../services/receiptValidationService';

interface ProcessPurchaseRequest extends AuthRequest {
  body: {
    productId: string;
    transactionId: string;
    receipt: string;
    platform: 'ios' | 'android';
    purchaseToken?: string;
  };
}

interface UseItemRequest extends AuthRequest {
  body: {
    type: 'superlike' | 'boost' | 'filter' | 'photo' | 'video' | 'gift';
    quantity: number;
  };
}

/**
 * @desc    Process IAP purchase and update user balance
 * @route   POST /api/iap/process-purchase
 * @access  Private
 */
export const processPurchase = async (
  req: ProcessPurchaseRequest,
  res: Response,
): Promise<void> => {
  try {
    const { productId, transactionId, receipt, platform, purchaseToken } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify receipt with platform using production-ready validation
    const validationResult = await validateReceipt(
      receipt,
      platform,
      purchaseToken,
      productId,
    );
    
    if (!validationResult.valid) {
      logger.warn('Receipt validation failed', {
        userId,
        platform,
        productId,
        transactionId,
        error: validationResult.error,
      });
      res.status(400).json({
        success: false,
        message: validationResult.error || 'Invalid receipt',
      });
      return;
    }
    
    // Ensure transaction ID matches validated receipt
    if (
      transactionId &&
      validationResult.transactionId &&
      transactionId !== validationResult.transactionId
    ) {
      logger.warn('Transaction ID mismatch', {
        userId,
        providedTransactionId: transactionId,
        validatedTransactionId: validationResult.transactionId,
      });
      res.status(400).json({
        success: false,
        message: 'Transaction ID mismatch',
      });
      return;
    }
    
    // Use validated transaction ID if provided one was invalid
    const finalTransactionId =
      validationResult.transactionId || transactionId;
    
    // Verify product ID matches
    if (
      productId &&
      validationResult.productId &&
      productId !== validationResult.productId
    ) {
      logger.warn('Product ID mismatch', {
        userId,
        providedProductId: productId,
        validatedProductId: validationResult.productId,
      });
      res.status(400).json({
        success: false,
        message: 'Product ID mismatch',
      });
      return;
    }

    // Check if transaction already processed (prevent duplicate processing)
    const existingTransaction = user.analytics?.events?.find(
      (e) =>
        e.type === 'iap_purchase' &&
        e.metadata?.transactionId === finalTransactionId,
    );

    if (existingTransaction) {
      logger.warn('Duplicate IAP transaction detected', {
        transactionId: finalTransactionId,
        userId,
      });
      // Return existing balance
      const balance = getUserIAPBalance(user);
      res.json({
        success: true,
        balance,
        message: 'Transaction already processed',
      });
      return;
    }

    // Process purchase based on product type
    const purchaseResult = await processProductPurchase(user, productId);

    if (!purchaseResult.success) {
      res.status(400).json({ success: false, message: purchaseResult.message });
      return;
    }

    // Record transaction in analytics
    if (!user.analytics) {
      user.analytics = {
        totalSwipes: 0,
        totalLikes: 0,
        totalMatches: 0,
        profileViews: 0,
        lastActive: new Date(),
        totalPetsCreated: 0,
        totalMessagesSent: 0,
        totalSubscriptionsStarted: 0,
        totalSubscriptionsCancelled: 0,
        totalPremiumFeaturesUsed: 0,
        events: [],
      };
    }

    user.analytics.events.push({
      type: 'iap_purchase',
      timestamp: new Date(),
      metadata: {
        productId: validationResult.productId || productId,
        transactionId: finalTransactionId,
        platform,
        quantity: purchaseResult.quantity,
        type: purchaseResult.productType,
        validated: true, // Mark as validated with production service
      },
    });

    await user.save();

    const balance = getUserIAPBalance(user);

    logger.info('IAP purchase processed successfully', {
      userId,
      productId: validationResult.productId || productId,
      transactionId: finalTransactionId,
      balance,
      platform,
    });

    res.json({
      success: true,
      balance,
      message: purchaseResult.message || 'Purchase processed successfully',
    });
  } catch (error: unknown) {
    logger.error('processPurchase error', {
      error: getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get user's IAP balance
 * @route   GET /api/iap/balance
 * @access  Private
 */
export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('premium');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const balance = getUserIAPBalance(user);

    res.json(balance);
  } catch (error: unknown) {
    logger.error('getBalance error', {
      error: getErrorMessage(error),
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Use an IAP item (Super Like, Boost, etc.)
 * @route   POST /api/iap/use-item
 * @access  Private
 */
export const useItem = async (req: UseItemRequest, res: Response): Promise<void> => {
  try {
    const { type, quantity } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Initialize premium.usage if needed
    if (!user.premium) {
      user.premium = {
        isActive: false,
        plan: 'free',
        usage: {
          swipesUsed: 0,
          swipesLimit: 5,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        },
      };
    }

    if (!user.premium.usage) {
      user.premium.usage = {
        swipesUsed: 0,
        swipesLimit: 5,
        superLikesUsed: 0,
        superLikesLimit: 0,
        boostsUsed: 0,
        boostsLimit: 0,
        messagesSent: 0,
        profileViews: 0,
        rewindsUsed: 0,
        iapSuperLikes: 0,
        iapBoosts: 0,
        iapGifts: 0,
      };
    }

    // Check balance and deduct
    let hasEnough = false;
    switch (type) {
      case 'superlike':
        hasEnough = (user.premium.usage.iapSuperLikes || 0) >= quantity;
        if (hasEnough) {
          user.premium.usage.iapSuperLikes = Math.max(
            0,
            (user.premium.usage.iapSuperLikes || 0) - quantity,
          );
        }
        break;
      case 'boost':
        hasEnough = (user.premium.usage.iapBoosts || 0) >= quantity;
        if (hasEnough) {
          user.premium.usage.iapBoosts = Math.max(0, (user.premium.usage.iapBoosts || 0) - quantity);
        }
        break;
      case 'gift':
        hasEnough = (user.premium.usage.iapGifts || 0) >= quantity;
        if (hasEnough) {
          user.premium.usage.iapGifts = Math.max(0, (user.premium.usage.iapGifts || 0) - quantity);
        }
        break;
      default:
        res.status(400).json({ success: false, message: `Invalid item type: ${type}` });
        return;
    }

    if (!hasEnough) {
      res.status(403).json({
        success: false,
        message: `Insufficient balance for ${type}. Please purchase more.`,
        balance: getUserIAPBalance(user),
      });
      return;
    }

    await user.save();

    const balance = getUserIAPBalance(user);

    logger.info('IAP item used', { userId, type, quantity, balance });

    res.json({ success: true, balance });
  } catch (error: unknown) {
    logger.error('useItem error', {
      error: getErrorMessage(error),
      userId: req.userId,
    });
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper functions
// Receipt validation has been moved to receiptValidationService.ts
// This function is kept for backwards compatibility but now uses the service
async function verifyReceipt(
  receipt: string,
  platform: 'ios' | 'android',
  purchaseToken?: string,
): Promise<boolean> {
  // In test mode, allow test receipts for faster testing
  if (process.env.NODE_ENV === 'test' && receipt.includes('test_')) {
    return true;
  }

  // Use production receipt validation service
  // Note: This requires productId which is available in processPurchase
  // This function is deprecated - use validateReceipt from receiptValidationService directly
  try {
    const result = await validateReceipt(
      receipt,
      platform,
      purchaseToken,
      undefined, // productId not available in this context
    );
    return result.valid;
  } catch (error) {
    logger.error('Receipt verification error', {
      error: getErrorMessage(error),
      platform,
    });
    return false;
  }
}

/**
 * Process product purchase and update user balance
 */
async function processProductPurchase(
  user: InstanceType<typeof User>,
  productId: string,
): Promise<{
  success: boolean;
  message?: string;
  quantity?: number;
  productType?: string;
}> {
  // Normalize product ID by extracting the core identifier
  // Handles both iOS (com.pawfectmatch.iap.superlike.single) and Android (iap_superlike_single) formats
  const normalizeProductId = (id: string): string => {
    // Remove iOS bundle prefix
    let normalized = id.replace(/^com\.pawfectmatch\.iap\./, '');
    // Handle Android format (already normalized)
    normalized = normalized.replace(/^iap_/, '');
    // Handle subscription products
    normalized = normalized.replace(/^premium\./, '');
    return normalized;
  };

  const normalizedId = normalizeProductId(productId);

  // Map normalized product IDs to types and quantities
  // Supports both direct product IDs and normalized versions
  const getProductInfo = (id: string): { type: string; quantity: number } | null => {
    // Direct mapping for normalized IDs
    const normalizedMap: Record<string, { type: string; quantity: number }> = {
      'superlike.single': { type: 'superlike', quantity: 1 },
      'superlike_single': { type: 'superlike', quantity: 1 },
      'superlike.pack10': { type: 'superlike', quantity: 10 },
      'superlike_pack10': { type: 'superlike', quantity: 10 },
      'boost.30min': { type: 'boost', quantity: 1 },
      'boost_30min': { type: 'boost', quantity: 1 },
      'filters.monthly': { type: 'filter', quantity: 1 },
      'filters_monthly': { type: 'filter', quantity: 1 },
      'photo.enhanced': { type: 'photo', quantity: 1 },
      'photo_enhanced': { type: 'photo', quantity: 1 },
      'video.profile': { type: 'video', quantity: 1 },
      'video_profile': { type: 'video', quantity: 1 },
      'gift.treat': { type: 'gift', quantity: 1 },
      'gift_treat': { type: 'gift', quantity: 1 },
      'gift.toy': { type: 'gift', quantity: 1 },
      'gift_toy': { type: 'gift', quantity: 1 },
      'gift.premium': { type: 'gift', quantity: 1 },
      'gift_premium': { type: 'gift', quantity: 1 },
    };

    // Try normalized ID first
    if (normalizedMap[id]) {
      return normalizedMap[id];
    }

    // Try pattern matching for flexible matching
    if (id.includes('superlike')) {
      if (id.includes('pack10') || id.includes('pack_10') || id.includes('10')) {
        return { type: 'superlike', quantity: 10 };
      }
      return { type: 'superlike', quantity: 1 };
    }
    if (id.includes('boost')) {
      return { type: 'boost', quantity: 1 };
    }
    if (id.includes('filter')) {
      return { type: 'filter', quantity: 1 };
    }
    if (id.includes('photo') || id.includes('enhanced')) {
      return { type: 'photo', quantity: 1 };
    }
    if (id.includes('video')) {
      return { type: 'video', quantity: 1 };
    }
    if (id.includes('gift')) {
      return { type: 'gift', quantity: 1 };
    }

    return null;
  };

  const product = getProductInfo(normalizedId);
  if (!product) {
    logger.warn('Unknown IAP product ID', { 
      originalProductId: productId, 
      normalizedId 
    });
    return { success: false, message: `Unknown product: ${productId}` };
  }

  // Initialize premium.usage if needed
  if (!user.premium) {
    user.premium = {
      isActive: false,
      plan: 'free',
      usage: {
        swipesUsed: 0,
        swipesLimit: 5,
        superLikesUsed: 0,
        superLikesLimit: 0,
        boostsUsed: 0,
        boostsLimit: 0,
        messagesSent: 0,
        profileViews: 0,
        rewindsUsed: 0,
        iapSuperLikes: 0,
        iapBoosts: 0,
        iapGifts: 0,
      },
    };
  }

  if (!user.premium.usage) {
    user.premium.usage = {
      swipesUsed: 0,
      swipesLimit: 5,
      superLikesUsed: 0,
      superLikesLimit: 0,
      boostsUsed: 0,
      boostsLimit: 0,
      messagesSent: 0,
      profileViews: 0,
      rewindsUsed: 0,
      iapSuperLikes: 0,
      iapBoosts: 0,
    };
  }

  // Update balance based on product type
  switch (product.type) {
    case 'superlike':
      user.premium.usage.iapSuperLikes = (user.premium.usage.iapSuperLikes || 0) + product.quantity;
      break;
    case 'boost':
      user.premium.usage.iapBoosts = (user.premium.usage.iapBoosts || 0) + product.quantity;
      break;
    case 'filter':
    case 'photo':
    case 'video':
      // These are non-consumable or handled differently
      // For now, just record the purchase
      break;
    case 'gift':
      // Gifts are consumable items
      user.premium.usage.iapGifts = (user.premium.usage.iapGifts || 0) + product.quantity;
      break;
    default:
      return { success: false, message: `Unknown product type: ${product.type}` };
  }

  await user.save();

  return {
    success: true,
    quantity: product.quantity,
    productType: product.type,
    message: `Successfully purchased ${product.quantity} ${product.type}(s)`,
  };
}

/**
 * Get user's IAP balance
 */
function getUserIAPBalance(user: InstanceType<typeof User>): {
  superLikes: number;
  boosts: number;
  filters: number;
  photos: number;
  videos: number;
  gifts: number;
} {
  return {
    superLikes: user.premium?.usage?.iapSuperLikes || 0,
    boosts: user.premium?.usage?.iapBoosts || 0,
    filters: 0, // Non-consumable subscription
    photos: 0, // One-time purchase, stored differently
    videos: 0, // One-time purchase, stored differently
    gifts: user.premium?.usage?.iapGifts || 0, // Consumable IAP item
  };
}

