/**
 * IAP Products Service Tests
 * Comprehensive test suite for in-app purchase functionality
 * Business Model: Microtransactions as per business.md
 */

import { iapProductsService, type IAPProduct, type PurchaseResult, type IAPBalance } from '../IAPProductsService';
import iapService from '../IAPService';
import { api } from '../api';
import { Platform } from 'react-native';

jest.mock('../IAPService');
jest.mock('../api');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: Record<string, unknown>) => obj.ios),
  },
}));

describe('IAPProductsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableProducts', () => {
    it('should return all available IAP products', () => {
      const products = iapProductsService.getAvailableProducts();
      
      expect(products.length).toBeGreaterThan(0);
      expect(products).toContainEqual(
        expect.objectContaining({
          id: 'superlike_single',
          type: 'superlike',
          price: 0.99,
        })
      );
      expect(products).toContainEqual(
        expect.objectContaining({
          id: 'superlike_pack_10',
          type: 'superlike',
          price: 4.99,
          quantity: 10,
        })
      );
      expect(products).toContainEqual(
        expect.objectContaining({
          id: 'boost_30min',
          type: 'boost',
          price: 2.99,
          duration: 30,
        })
      );
    });

    it('should include products from business.md pricing strategy', () => {
      const products = iapProductsService.getAvailableProducts();
      
      // Super Likes - $0.99 each, $4.99 for 10
      const superLikeSingle = products.find(p => p.id === 'superlike_single');
      expect(superLikeSingle).toBeDefined();
      expect(superLikeSingle?.price).toBe(0.99);

      const superLikePack = products.find(p => p.id === 'superlike_pack_10');
      expect(superLikePack).toBeDefined();
      expect(superLikePack?.price).toBe(4.99);
      expect(superLikePack?.quantity).toBe(10);

      // Profile Boosts - $2.99 for 30 minutes
      const boost = products.find(p => p.id === 'boost_30min');
      expect(boost).toBeDefined();
      expect(boost?.price).toBe(2.99);
      expect(boost?.duration).toBe(30);

      // Premium Filters - $1.99/month add-on
      const filters = products.find(p => p.id === 'premium_filters_monthly');
      expect(filters).toBeDefined();
      expect(filters?.price).toBe(1.99);

      // Enhanced Photos - $0.49 each
      const photo = products.find(p => p.id === 'enhanced_photo');
      expect(photo).toBeDefined();
      expect(photo?.price).toBe(0.49);

      // Video Profiles - $4.99 one-time
      const video = products.find(p => p.id === 'video_profile');
      expect(video).toBeDefined();
      expect(video?.price).toBe(4.99);

      // Gift Shop items - $2.99-$9.99
      const giftTreat = products.find(p => p.id === 'gift_treat');
      expect(giftTreat).toBeDefined();
      expect(giftTreat?.price).toBe(2.99);

      const giftPremium = products.find(p => p.id === 'gift_premium');
      expect(giftPremium).toBeDefined();
      expect(giftPremium?.price).toBe(9.99);
    });
  });

  describe('getProduct', () => {
    it('should return product by ID', () => {
      const product = iapProductsService.getProduct('superlike_single');
      
      expect(product).toBeDefined();
      expect(product?.id).toBe('superlike_single');
      expect(product?.type).toBe('superlike');
      expect(product?.price).toBe(0.99);
    });

    it('should return product by productId', () => {
      const product = iapProductsService.getProduct('com.pawfectmatch.iap.superlike.single');
      
      expect(product).toBeDefined();
      expect(product?.productId).toContain('superlike.single');
    });

    it('should return undefined for non-existent product', () => {
      const product = iapProductsService.getProduct('non_existent');
      
      expect(product).toBeUndefined();
    });
  });

  describe('getProductsByType', () => {
    it('should return all Super Like products', () => {
      const products = iapProductsService.getProductsByType('superlike');
      
      expect(products.length).toBeGreaterThan(0);
      products.forEach(product => {
        expect(product.type).toBe('superlike');
      });
    });

    it('should return all Boost products', () => {
      const products = iapProductsService.getProductsByType('boost');
      
      expect(products.length).toBeGreaterThan(0);
      products.forEach(product => {
        expect(product.type).toBe('boost');
      });
    });
  });

  describe('purchaseProduct', () => {
    const mockPurchase = {
      productId: 'com.pawfectmatch.iap.superlike.single',
      transactionId: 'txn_test_123',
      transactionDate: Date.now(),
      transactionReceipt: 'receipt_test_123',
      purchaseToken: 'token_test_123',
      isAcknowledged: false,
    };

    const mockBalance: IAPBalance = {
      superLikes: 5,
      boosts: 0,
      filters: 0,
      photos: 0,
      videos: 0,
      gifts: 0,
    };

    beforeEach(() => {
      (iapService.purchaseProduct as jest.Mock).mockResolvedValue(mockPurchase);
      (iapService.finishTransaction as jest.Mock).mockResolvedValue(undefined);
      (api.request as jest.Mock).mockResolvedValue({
        success: true,
        balance: mockBalance,
        message: 'Purchase processed successfully',
      });
    });

    it('should successfully purchase a product', async () => {
      const result = await iapProductsService.purchaseProduct('superlike_single');

      expect(result.success).toBe(true);
      expect(result.product.id).toBe('superlike_single');
      expect(result.transactionId).toBe('txn_test_123');
      expect(result.balance).toBe(5); // superLikes balance
      expect(iapService.purchaseProduct).toHaveBeenCalled();
      expect(api.request).toHaveBeenCalledWith('/iap/process-purchase', expect.any(Object));
      expect(iapService.finishTransaction).toHaveBeenCalled();
    });

    it('should throw error for non-existent product', async () => {
      await expect(iapProductsService.purchaseProduct('non_existent')).rejects.toThrow(
        'Product not found'
      );
    });

    it('should handle purchase failure', async () => {
      (iapService.purchaseProduct as jest.Mock).mockRejectedValue(
        new Error('Purchase failed')
      );

      await expect(iapProductsService.purchaseProduct('superlike_single')).rejects.toThrow(
        'Purchase failed'
      );
    });

    it('should handle server processing failure', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid receipt',
      });

      await expect(iapProductsService.purchaseProduct('superlike_single')).rejects.toThrow(
        'Invalid receipt'
      );
    });
  });

  describe('getBalance', () => {
    const mockBalance: IAPBalance = {
      superLikes: 10,
      boosts: 2,
      filters: 1,
      photos: 5,
      videos: 1,
      gifts: 3,
    };

    it('should return current IAP balance', async () => {
      (api.request as jest.Mock).mockResolvedValue(mockBalance);

      const balance = await iapProductsService.getBalance();

      expect(balance).toEqual(mockBalance);
      expect(api.request).toHaveBeenCalledWith('/iap/balance');
    });

    it('should return empty balance on error', async () => {
      (api.request as jest.Mock).mockRejectedValue(new Error('Network error'));

      const balance = await iapProductsService.getBalance();

      expect(balance).toEqual({
        superLikes: 0,
        boosts: 0,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });
    });
  });

  describe('useIAPItem', () => {
    const mockBalance: IAPBalance = {
      superLikes: 9,
      boosts: 1,
      filters: 0,
      photos: 0,
      videos: 0,
      gifts: 0,
    };

    it('should successfully use a Super Like', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        success: true,
        balance: mockBalance,
      });

      const result = await iapProductsService.useIAPItem('superlike', 1);

      expect(result).toBe(true);
      expect(api.request).toHaveBeenCalledWith('/iap/use-item', {
        method: 'POST',
        body: JSON.stringify({ type: 'superlike', quantity: 1 }),
      });
    });

    it('should successfully use a Boost', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        success: true,
        balance: mockBalance,
      });

      const result = await iapProductsService.useIAPItem('boost', 1);

      expect(result).toBe(true);
      expect(api.request).toHaveBeenCalledWith('/iap/use-item', {
        method: 'POST',
        body: JSON.stringify({ type: 'boost', quantity: 1 }),
      });
    });

    it('should return false on insufficient balance', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        success: false,
        balance: mockBalance,
      });

      const result = await iapProductsService.useIAPItem('superlike', 1);

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (api.request as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await iapProductsService.useIAPItem('superlike', 1);

      expect(result).toBe(false);
    });
  });

  describe('hasEnoughBalance', () => {
    it('should return true when balance is sufficient', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        superLikes: 10,
        boosts: 5,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });

      const hasEnough = await iapProductsService.hasEnoughBalance('superlike', 5);

      expect(hasEnough).toBe(true);
    });

    it('should return false when balance is insufficient', async () => {
      (api.request as jest.Mock).mockResolvedValue({
        superLikes: 3,
        boosts: 0,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });

      const hasEnough = await iapProductsService.hasEnoughBalance('superlike', 5);

      expect(hasEnough).toBe(false);
    });

    it('should return false on error', async () => {
      (api.request as jest.Mock).mockRejectedValue(new Error('Network error'));

      const hasEnough = await iapProductsService.hasEnoughBalance('superlike', 1);

      expect(hasEnough).toBe(false);
    });
  });
});

