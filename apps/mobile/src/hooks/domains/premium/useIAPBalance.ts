/**
 * useIAPBalance Hook
 * Manages IAP balance state and provides methods to purchase and use items
 */
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { IAPProductsService, type IAPBalance, type IAPProduct } from '../../../services/IAPProductsService';

interface UseIAPBalanceReturn {
  balance: IAPBalance;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<{ success: boolean; message?: string }>;
  useItem: (type: IAPProduct['type'], quantity?: number) => Promise<boolean>;
  hasEnoughBalance: (type: IAPProduct['type'], quantity?: number) => Promise<boolean>;
}

export const useIAPBalance = (): UseIAPBalanceReturn => {
  const [balance, setBalance] = useState<IAPBalance>({
    superLikes: 0,
    boosts: 0,
    filters: 0,
    photos: 0,
    videos: 0,
    gifts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newBalance = await IAPProductsService.getBalance();
      setBalance(newBalance);
      logger.info('IAP balance refreshed', { balance: newBalance });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch IAP balance';
      setError(errorMessage);
      logger.error('Failed to refresh IAP balance', { error: err });
      // Set empty balance on error
      setBalance({
        superLikes: 0,
        boosts: 0,
        filters: 0,
        photos: 0,
        videos: 0,
        gifts: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseProduct = useCallback(
    async (productId: string): Promise<{ success: boolean; message?: string }> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await IAPProductsService.purchaseProduct(productId);
        
        // Refresh balance after purchase
        await refreshBalance();
        
        logger.info('IAP product purchased', {
          productId,
          transactionId: result.transactionId,
          balance: result.balance,
        });
        
        return {
          success: true,
          message: result.message || 'Purchase successful',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
        setError(errorMessage);
        logger.error('IAP purchase failed', { error: err, productId });
        
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshBalance],
  );

  const useItem = useCallback(
    async (type: IAPProduct['type'], quantity: number = 1): Promise<boolean> => {
      try {
        const success = await IAPProductsService.useIAPItem(type, quantity);
        
        if (success) {
          // Refresh balance after using item
          await refreshBalance();
        }
        
        logger.info('IAP item used', { type, quantity, success });
        return success;
      } catch (err) {
        logger.error('Failed to use IAP item', { error: err, type, quantity });
        return false;
      }
    },
    [refreshBalance],
  );

  const hasEnoughBalance = useCallback(
    async (type: IAPProduct['type'], quantity: number = 1): Promise<boolean> => {
      try {
        return await IAPProductsService.hasEnoughBalance(type, quantity);
      } catch (err) {
        logger.error('Failed to check IAP balance', { error: err });
        return false;
      }
    },
    [],
  );

  // Auto-refresh on mount
  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    purchaseProduct,
    useItem,
    hasEnoughBalance,
  };
};

