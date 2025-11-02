/**
 * Premium Feature Service for PawfectMatch
 * Manages premium features and access control
 */

import User from '../models/User';
import logger from '../utils/logger';

class PremiumFeatureService {
  /**
   * Check if user has premium access
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return false;
      }

      return user.premium.isActive && 
             user.premium.paymentStatus === 'active' &&
             (!user.premium.expiresAt || user.premium.expiresAt > new Date());
    } catch (error) {
      logger.error('Error checking premium access', { error, userId });
      return false;
    }
  }

  /**
   * Check specific premium feature access
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const hasAccess = await this.hasPremiumAccess(userId);
      if (!hasAccess) {
        return false;
      }

      const user = await User.findById(userId);
      if (!user) {
        return false;
      }

      return user.premium.features[feature as keyof typeof user.premium.features] || false;
    } catch (error) {
      logger.error('Error checking feature access', { error, userId, feature });
      return false;
    }
  }

  /**
   * Get user's premium features
   */
  async getUserPremiumFeatures(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      return {
        isActive: user.premium.isActive,
        plan: user.premium.plan,
        features: user.premium.features,
        expiresAt: user.premium.expiresAt
      };
    } catch (error) {
      logger.error('Error getting user premium features', { error, userId });
      return null;
    }
  }

  /**
   * Activate premium features
   */
  async activatePremiumFeatures(userId: string, plan: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.premium.isActive = true;
      user.premium.plan = plan as any;
      user.premium.paymentStatus = 'active';
      
      // Set feature access based on plan
      user.premium.features = this.getPlanFeatures(plan);
      
      await user.save();
      
      logger.info('Premium features activated', { userId, plan });
    } catch (error) {
      logger.error('Error activating premium features', { error, userId, plan });
      throw error;
    }
  }

  /**
   * Deactivate premium features
   */
  async deactivatePremiumFeatures(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.premium.isActive = false;
      user.premium.paymentStatus = 'cancelled';
      user.premium.features = this.getPlanFeatures('basic');
      
      await user.save();
      
      logger.info('Premium features deactivated', { userId });
    } catch (error) {
      logger.error('Error deactivating premium features', { error, userId });
      throw error;
    }
  }

  /**
   * Get plan features
   */
  private getPlanFeatures(plan: string): any {
    const features = {
      basic: {
        unlimitedLikes: false,
        boostProfile: false,
        seeWhoLiked: false,
        advancedFilters: false,
        aiMatching: false
      },
      premium: {
        unlimitedLikes: true,
        boostProfile: true,
        seeWhoLiked: true,
        advancedFilters: true,
        aiMatching: false
      },
      ultimate: {
        unlimitedLikes: true,
        boostProfile: true,
        seeWhoLiked: true,
        advancedFilters: true,
        aiMatching: true
      }
    };

    return features[plan as keyof typeof features] || features.basic;
  }
}

export default new PremiumFeatureService();
