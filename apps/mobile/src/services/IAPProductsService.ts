/**
 * IAP Products Service for PawfectMatch Mobile App
 * Handles in-app purchases for Super Likes, Profile Boosts, and other consumables
 * Business Model: Microtransactions as per business.md
 */

import { logger } from '@pawfectmatch/core';
import { api } from './api';
import iapService from './IAPService';
import { Platform } from 'react-native';

export interface IAPProduct {
  id: string;
  productId: string; // Store product ID
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'superlike' | 'boost' | 'filter' | 'photo' | 'video' | 'gift';
  quantity?: number; // For packs (e.g., 10 Super Likes)
  duration?: number; // For boosts (in minutes)
}

export interface PurchaseResult {
  success: boolean;
  product: IAPProduct;
  transactionId: string;
  balance: number; // New balance after purchase
  message?: string;
}

export interface IAPBalance {
  superLikes: number;
  boosts: number;
  filters: number;
  photos: number;
  videos: number;
  gifts: number;
}

/**
 * IAP Products as per business.md pricing strategy
 */
const IAP_PRODUCTS: IAPProduct[] = [
  // Super Likes - $0.99 each, $4.99 for 10
  {
    id: 'superlike_single',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.superlike.single',
      android: 'iap_superlike_single',
      default: 'iap_superlike_single',
    }) as string,
    name: 'Super Like',
    description: 'Send an enhanced "I\'m very interested" signal',
    price: 0.99,
    currency: 'USD',
    type: 'superlike',
    quantity: 1,
  },
  {
    id: 'superlike_pack_10',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.superlike.pack10',
      android: 'iap_superlike_pack10',
      default: 'iap_superlike_pack10',
    }) as string,
    name: '10 Super Likes',
    description: 'Best value! Get 10 Super Likes',
    price: 4.99,
    currency: 'USD',
    type: 'superlike',
    quantity: 10,
  },
  // Profile Boosts - $2.99 for 30 minutes
  {
    id: 'boost_30min',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.boost.30min',
      android: 'iap_boost_30min',
      default: 'iap_boost_30min',
    }) as string,
    name: 'Profile Boost',
    description: '10x more visibility for 30 minutes',
    price: 2.99,
    currency: 'USD',
    type: 'boost',
    duration: 30,
  },
  // Premium Filters - $1.99/month add-on
  {
    id: 'premium_filters_monthly',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.filters.monthly',
      android: 'iap_filters_monthly',
      default: 'iap_filters_monthly',
    }) as string,
    name: 'Premium Filters',
    description: 'Vaccination status, temperament matching',
    price: 1.99,
    currency: 'USD',
    type: 'filter',
  },
  // Enhanced Photos - $0.49 each
  {
    id: 'enhanced_photo',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.photo.enhanced',
      android: 'iap_photo_enhanced',
      default: 'iap_photo_enhanced',
    }) as string,
    name: 'Enhanced Photo',
    description: 'AI-enhanced pet photo',
    price: 0.49,
    currency: 'USD',
    type: 'photo',
  },
  // Video Profiles - $4.99 one-time
  {
    id: 'video_profile',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.video.profile',
      android: 'iap_video_profile',
      default: 'iap_video_profile',
    }) as string,
    name: 'Video Profile',
    description: '30-second video introduction',
    price: 4.99,
    currency: 'USD',
    type: 'video',
  },
  // Gift Shop items - $2.99-$9.99
  {
    id: 'gift_treat',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.gift.treat',
      android: 'iap_gift_treat',
      default: 'iap_gift_treat',
    }) as string,
    name: 'Virtual Treat',
    description: 'Send a virtual treat to a match',
    price: 2.99,
    currency: 'USD',
    type: 'gift',
  },
  {
    id: 'gift_toy',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.gift.toy',
      android: 'iap_gift_toy',
      default: 'iap_gift_toy',
    }) as string,
    name: 'Virtual Toy',
    description: 'Send a virtual toy to a match',
    price: 4.99,
    currency: 'USD',
    type: 'gift',
  },
  {
    id: 'gift_premium',
    productId: Platform.select({
      ios: 'com.pawfectmatch.iap.gift.premium',
      android: 'iap_gift_premium',
      default: 'iap_gift_premium',
    }) as string,
    name: 'Premium Gift Bundle',
    description: 'Exclusive gift bundle for matches',
    price: 9.99,
    currency: 'USD',
    type: 'gift',
  },
];

class IAPProductsService {
  /**
   * Get all available IAP products
   */
  getAvailableProducts(): IAPProduct[] {
    return IAP_PRODUCTS;
  }

  /**
   * Get a specific product by ID
   */
  getProduct(productId: string): IAPProduct | undefined {
    return IAP_PRODUCTS.find((p) => p.id === productId || p.productId === productId);
  }

  /**
   * Get products by type
   */
  getProductsByType(type: IAPProduct['type']): IAPProduct[] {
    return IAP_PRODUCTS.filter((p) => p.type === type);
  }

  /**
   * Purchase an IAP product
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    try {
      const product = this.getProduct(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      logger.info('Starting IAP purchase', { productId, type: product.type });

      // Purchase via native IAP service
      const purchase = await iapService.purchaseProduct(product.productId);

      // Verify and process on server
      const response = await api.request<{
        success: boolean;
        balance: IAPBalance;
        message?: string;
      }>('/iap/process-purchase', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          transactionId: purchase.transactionId,
          receipt: purchase.transactionReceipt,
          platform: Platform.OS,
          purchaseToken: purchase.purchaseToken,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Purchase processing failed');
      }

      // Finish transaction (required on iOS)
      await iapService.finishTransaction(purchase);

      logger.info('IAP purchase completed', {
        productId,
        transactionId: purchase.transactionId,
        balance: response.balance,
      });

      const balance = this.getBalanceForProduct(product.type, response.balance);

      return {
        success: true,
        product,
        transactionId: purchase.transactionId,
        balance,
        message: response.message,
      };
    } catch (error) {
      logger.error('IAP purchase failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        productId,
      });
      throw error;
    }
  }

  /**
   * Get current IAP balance
   */
  async getBalance(): Promise<IAPBalance> {
    try {
      const response = await api.request<IAPBalance>('/iap/balance');
      return response;
    } catch (error) {
      logger.error('Failed to get IAP balance', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      // Return empty balance on error
      return {
        superLikes: 0,
        boosts: 0,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      };
    }
  }

  /**
   * Use a consumable IAP item (Super Like, Boost, etc.)
   */
  async useIAPItem(type: IAPProduct['type'], quantity: number = 1): Promise<boolean> {
    try {
      const response = await api.request<{ success: boolean; balance: IAPBalance }>(
        '/iap/use-item',
        {
          method: 'POST',
          body: JSON.stringify({ type, quantity }),
        },
      );

      if (!response.success) {
        return false;
      }

      logger.info('IAP item used', { type, quantity, balance: response.balance });
      return true;
    } catch (error) {
      logger.error('Failed to use IAP item', {
        error: error instanceof Error ? error : new Error(String(error)),
        type,
        quantity,
      });
      return false;
    }
  }

  /**
   * Check if user has enough balance for an item
   */
  async hasEnoughBalance(type: IAPProduct['type'], quantity: number = 1): Promise<boolean> {
    try {
      const balance = await this.getBalance();
      return this.checkBalanceForType(type, balance) >= quantity;
    } catch (error) {
      logger.error('Failed to check IAP balance', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  // Private helper methods

  private getBalanceForProduct(type: IAPProduct['type'], balance: IAPBalance): number {
    return this.checkBalanceForType(type, balance);
  }

  private checkBalanceForType(type: IAPProduct['type'], balance: IAPBalance): number {
    switch (type) {
      case 'superlike':
        return balance.superLikes;
      case 'boost':
        return balance.boosts;
      case 'filter':
        return balance.filters;
      case 'photo':
        return balance.photos;
      case 'video':
        return balance.videos;
      case 'gift':
        return balance.gifts;
      default:
        return 0;
    }
  }
}

// Export singleton instance
export const iapProductsService = new IAPProductsService();
export default iapProductsService;

