/**
 * Referral Service
 * Handles referral code operations and stats
 * Business Model: Give 1 month free Premium for successful referrals
 */

import { logger } from '@pawfectmatch/core';
import { api } from './api';

export interface ReferralCodeResponse {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: number;
}

export interface ReferralStatsResponse {
  referralCode: string | null;
  stats: ReferralStats;
}

export interface ApplyReferralCodeResponse {
  success: boolean;
  message: string;
  data?: {
    referrerName: string;
    premiumActive: boolean;
    premiumExpiresAt: Date;
  };
}

class ReferralService {
  /**
   * Get user's referral code and basic stats
   */
  async getReferralCode(): Promise<ReferralCodeResponse> {
    try {
      const response = await api.request<ReferralCodeResponse>('/referrals/code');
      logger.info('Referral code retrieved', { code: response.referralCode });
      return response;
    } catch (error) {
      logger.error('Failed to get referral code', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Apply a referral code during signup or later
   */
  async applyReferralCode(referralCode: string): Promise<ApplyReferralCodeResponse> {
    try {
      const response = await api.request<ApplyReferralCodeResponse>('/referrals/apply', {
        method: 'POST',
        body: JSON.stringify({ referralCode }),
      });
      logger.info('Referral code applied', { referralCode, success: response.success });
      return response;
    } catch (error) {
      logger.error('Failed to apply referral code', {
        error: error instanceof Error ? error : new Error(String(error)),
        referralCode,
      });
      throw error;
    }
  }

  /**
   * Get detailed referral statistics
   */
  async getReferralStats(): Promise<ReferralStatsResponse> {
    try {
      const response = await api.request<ReferralStatsResponse>('/referrals/stats');
      logger.info('Referral stats retrieved', { stats: response.stats });
      return response;
    } catch (error) {
      logger.error('Failed to get referral stats', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }
}

export const referralService = new ReferralService();
export default referralService;

