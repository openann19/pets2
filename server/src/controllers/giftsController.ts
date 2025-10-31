/**
 * Gifts Controller - Gift Shop Feature
 * Business Model: Virtual gifts ($2.99-$9.99)
 * - Virtual Treat: $2.99
 * - Virtual Toy: $4.99
 * - Premium Gift Bundle: $9.99
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';
import User from '../models/User';
import Match from '../models/Match';
import { sendPushToUser } from '../services/pushNotificationService';

/**
 * @desc    Send a gift to a match
 * @route   POST /api/gifts/send
 * @access  Private
 */
export const sendGift = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { matchId, giftType } = req.body;
    const userId = req.userId;

    if (!matchId || !giftType) {
      res.status(400).json({
        success: false,
        message: 'Match ID and gift type are required',
      });
      return;
    }

    const validGiftTypes = ['treat', 'toy', 'premium'];
    if (!validGiftTypes.includes(giftType)) {
      res.status(400).json({
        success: false,
        message: `Invalid gift type. Must be one of: ${validGiftTypes.join(', ')}`,
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Initialize premium if needed (matching structure from User model)
    if (!user.premium) {
      (user as any).premium = {
        isActive: false,
        plan: 'free',
        cancelAtPeriodEnd: false,
        paymentStatus: 'active',
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

    if (!user.premium?.usage) {
      if (!user.premium) {
        (user as any).premium = {
          isActive: false,
          plan: 'free',
          cancelAtPeriodEnd: false,
          paymentStatus: 'active',
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
      } else {
        (user.premium as any).usage = {
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
    }

    // Check if user has gift balance (purchased via IAP)
    const giftBalance = user.premium?.usage?.iapGifts || 0;
    if (giftBalance <= 0) {
      res.status(403).json({
        success: false,
        message: 'No gifts remaining. Purchase more from the Premium screen.',
        code: 'GIFT_INSUFFICIENT_BALANCE',
        canPurchase: true,
        balance: giftBalance,
      });
      return;
    }

    // Verify match exists and user is part of it
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found or not active',
      });
      return;
    }

    // Get recipient
    const recipientId =
      match.user1.toString() === userId ? match.user2 : match.user1;
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
      return;
    }

    // Deduct gift from balance
    if (user.premium?.usage) {
      user.premium.usage.iapGifts = Math.max(0, giftBalance - 1);
    }

    // Create gift record and store in database
    const Gift = (await import('../models/Gift')).default;
    const gift = await Gift.create({
      senderId: userId,
      recipientId: recipientId.toString(),
      matchId,
      giftType,
      message: req.body.message || '',
      sentAt: new Date(),
      status: 'sent',
    });

    // Save user balance update
    await user.save();

    logger.info('Gift sent', {
      userId,
      recipientId: recipientId.toString(),
      matchId,
      giftType,
      giftId: gift._id,
    });

    // Create notification for recipient
    try {
      const senderName = (user as any).firstName || 'Someone';
      await sendPushToUser(recipientId.toString(), {
        title: '🎁 New Gift!',
        body: `${senderName} sent you a ${giftType} gift!`,
        data: {
          type: 'gift',
          giftId: gift._id.toString(),
          matchId,
          senderId: userId,
        },
        sound: true,
        priority: 'high',
      });
    } catch (notificationError) {
      logger.error('Failed to send gift notification', { error: notificationError });
      // Don't fail the gift send if notification fails
    }

    res.json({
      success: true,
      message: `Gift sent successfully to ${(recipient as any).firstName || 'your match'}!`,
      data: {
        giftId: gift._id,
        giftType,
        recipientName: (recipient as any).firstName || 'Match',
        balance: user.premium?.usage?.iapGifts || 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to send gift', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send gift',
    });
  }
};

/**
 * @desc    Get received gifts
 * @route   GET /api/gifts/received
 * @access  Private
 */
export const getReceivedGifts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Query gifts received by this user
    const Gift = (await import('../models/Gift')).default;
    const gifts = await Gift.find({
      recipientId: userId,
      status: 'sent',
    })
      .populate('senderId', 'firstName lastName profilePhoto')
      .populate('matchId', 'status')
      .sort({ sentAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        gifts,
        total: gifts.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get received gifts', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get received gifts',
    });
  }
};

