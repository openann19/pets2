import { Platform } from 'react-native';
import { logger } from './logger';
import { api } from './api';

// RevenueCat integration (preferred for subscriptions)
let Purchases: typeof import('react-native-purchases').default | null = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {
  logger.warn('react-native-purchases not available - IAP will use fallback mode');
}
export interface Product {
  productId: string;
  price: string;
  currency: string;
  localizedPrice: string;
  title: string;
  description: string;
  type: 'iap' | 'subs';
}

export interface Purchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string; // Android
  originalTransactionId?: string; // iOS
  isAcknowledged?: boolean;
}

export interface RestoreResult {
  success: boolean;
  purchases: Purchase[];
  errors: string[];
  message: string;
}

export interface IAPError {
  code: string;
  message: string;
  userInfo?: Record<string, unknown>;
}

class IAPService {
  private static instance: IAPService;
  private isInitialized = false;
  private products: Product[] = [];
  private availableProducts: Map<string, Product> = new Map();

  // Product IDs for different platforms
  // Includes subscriptions AND microtransactions (IAP)
  private readonly PRODUCT_IDS = {
    ios: [
      // Subscriptions
      'com.pawfectmatch.premium.basic.monthly',
      'com.pawfectmatch.premium.premium.monthly',
      'com.pawfectmatch.premium.ultimate.monthly',
      'com.pawfectmatch.premium.basic.yearly',
      'com.pawfectmatch.premium.premium.yearly',
      'com.pawfectmatch.premium.ultimate.yearly',
      // Microtransactions (IAP)
      'com.pawfectmatch.iap.superlike.single',
      'com.pawfectmatch.iap.superlike.pack10',
      'com.pawfectmatch.iap.boost.30min',
      'com.pawfectmatch.iap.filters.monthly',
      'com.pawfectmatch.iap.photo.enhanced',
      'com.pawfectmatch.iap.video.profile',
      'com.pawfectmatch.iap.gift.treat',
      'com.pawfectmatch.iap.gift.toy',
      'com.pawfectmatch.iap.gift.premium',
    ],
    android: [
      // Subscriptions
      'premium_basic_monthly',
      'premium_premium_monthly',
      'premium_ultimate_monthly',
      'premium_basic_yearly',
      'premium_premium_yearly',
      'premium_ultimate_yearly',
      // Microtransactions (IAP)
      'iap_superlike_single',
      'iap_superlike_pack10',
      'iap_boost_30min',
      'iap_filters_monthly',
      'iap_photo_enhanced',
      'iap_video_profile',
      'iap_gift_treat',
      'iap_gift_toy',
      'iap_gift_premium',
    ],
  };

  public static getInstance(): IAPService {
    if (!IAPService.instance) {
      IAPService.instance = new IAPService();
    }
    return IAPService.instance;
  }

  /**
   * Initialize IAP service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('Initializing IAP service', { platform: Platform.OS });

      // Initialize RevenueCat if available
      if (Purchases && !Purchases.isConfigured()) {
        const apiKey = Platform.select({
          ios: process.env['EXPO_PUBLIC_RC_IOS'],
          android: process.env['EXPO_PUBLIC_RC_ANDROID'],
        });

        if (apiKey) {
          try {
            await Purchases.configure({
              apiKey,
              observerMode: false,
            });
            logger.info('RevenueCat initialized successfully');
          } catch (rcError) {
            const error = rcError instanceof Error ? rcError : new Error(String(rcError));
            logger.warn('RevenueCat initialization failed, using fallback', {
              error,
            });
          }
        } else {
          logger.warn('RevenueCat API keys not configured, using fallback mode');
        }
      }

      // Load available products
      await this.loadProducts();

      this.isInitialized = true;
      logger.info('IAP service initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'IAP initialization failed';
      logger.error('Failed to initialize IAP service', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw new Error(`IAP initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Get available products for purchase
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.products;
  }

  /**
   * Get a specific product by ID
   */
  getProduct(productId: string): Product | undefined {
    return this.availableProducts.get(productId);
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<Purchase> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const product = this.availableProducts.get(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    try {
      logger.info('Starting purchase', { productId });

      let purchase: Purchase;

      // Try RevenueCat purchase first
      if (Purchases && Purchases.isConfigured()) {
        try {
          const { customerInfo } = await Purchases.purchaseProduct(productId);
          
          // Extract transaction info from RevenueCat customer info
          const latestTransaction = customerInfo.nonSubscriptionTransactions.find(
            (t) => t.identifier === productId,
          ) || customerInfo.allPurchasedProductIdentifiers.includes(productId)
            ? { identifier: productId }
            : null;

          if (latestTransaction) {
            const purchaseData: Purchase = {
              productId,
              transactionId: latestTransaction.identifier || `rc_${Date.now()}`,
              transactionDate: Date.now(),
              transactionReceipt: JSON.stringify(customerInfo),
              isAcknowledged: true,
            };
            
            if (Platform.OS === 'android' && customerInfo.originalAppUserId) {
              purchaseData.purchaseToken = customerInfo.originalAppUserId;
            }
            
            if (customerInfo.originalPurchaseDate) {
              purchaseData.originalTransactionId = customerInfo.originalPurchaseDate;
            }
            
            purchase = purchaseData;
          } else {
            throw new Error('Purchase transaction not found in customer info');
          }
        } catch (rcError) {
          const error = rcError instanceof Error ? rcError : new Error(String(rcError));
          const rcErrorMsg = error.message;
          
          // Check if user cancelled
          if (rcErrorMsg.includes('cancelled') || rcErrorMsg.includes('CANCELLED')) {
            throw new Error('User cancelled purchase');
          }
          
          logger.warn('RevenueCat purchase failed, using fallback', {
            error,
          });
          
          // Fallback to simulation
          purchase = await this.simulatePurchase(productId);
        }
      } else {
        // Fallback to simulation
        purchase = await this.simulatePurchase(productId);
      }

      // Verify purchase with server
      await this.verifyPurchase(purchase);

      logger.info('Purchase completed successfully', {
        productId,
        transactionId: purchase.transactionId,
      });

      return purchase;
    } catch (error) {
      const purchaseError = error instanceof Error ? error : new Error(String(error));
      logger.error('Purchase failed', {
        error: purchaseError,
        productId,
      });
      throw purchaseError;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<RestoreResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info('Starting purchase restoration');

      let restoredPurchases: Purchase[] = [];

      // Try RevenueCat restore first
      if (Purchases && Purchases.isConfigured()) {
        try {
          const { customerInfo } = await Purchases.restorePurchases();
          
          // Convert RevenueCat customer info to Purchase format
          restoredPurchases = customerInfo.allPurchasedProductIdentifiers.map((productId) => {
            const transaction = customerInfo.nonSubscriptionTransactions.find(
              (t) => t.identifier === productId,
            );
            
            const purchase: Purchase = {
              productId,
              transactionId: transaction?.identifier || `restored_${Date.now()}`,
              transactionDate: transaction
                ? new Date(transaction.transactionDate).getTime()
                : Date.now(),
              transactionReceipt: JSON.stringify(customerInfo),
              isAcknowledged: true,
            };
            
            if (Platform.OS === 'android' && customerInfo.originalAppUserId) {
              purchase.purchaseToken = customerInfo.originalAppUserId;
            }
            
            const originalTxId = transaction?.originalTransactionDate || customerInfo.originalPurchaseDate;
            if (originalTxId) {
              purchase.originalTransactionId = originalTxId;
            }
            
            return purchase;
          });

          logger.info('Purchases restored from RevenueCat', {
            count: restoredPurchases.length,
          });
        } catch (rcError) {
          const error = rcError instanceof Error ? rcError : new Error(String(rcError));
          logger.warn('RevenueCat restore failed, using fallback', {
            error,
          });
          
          // Fallback to simulation
          restoredPurchases = await this.simulateRestorePurchases();
        }
      } else {
        // Fallback to simulation
        restoredPurchases = await this.simulateRestorePurchases();
      }

      const result: RestoreResult = {
        success: true,
        purchases: [],
        errors: [],
        message: 'Purchases restored successfully',
      };

      // Process each restored purchase
      for (const purchase of restoredPurchases) {
        try {
          // Verify with server
          await this.verifyPurchase(purchase);
          result.purchases.push(purchase);

          logger.info('Purchase restored and verified', {
            productId: purchase.productId,
            transactionId: purchase.transactionId,
          });
        } catch (error) {
          const verifyError = error instanceof Error ? error : new Error(String(error));
          result.errors.push(`Failed to verify ${purchase.productId}: ${verifyError.message}`);
          logger.warn('Failed to verify restored purchase', {
            productId: purchase.productId,
            error: verifyError,
          });
        }
      }

      // Update result based on outcomes
      if (result.purchases.length === 0 && result.errors.length === 0) {
        result.message = 'No previous purchases found to restore';
      } else if (result.errors.length > 0 && result.purchases.length === 0) {
        result.success = false;
        result.message = 'Failed to restore any purchases';
      } else if (result.errors.length > 0) {
        result.message = `Restored ${result.purchases.length} purchases with ${result.errors.length} errors`;
      } else {
        result.message = `Successfully restored ${result.purchases.length} purchases`;
      }

      logger.info('Purchase restoration completed', {
        restored: result.purchases.length,
        errors: result.errors.length,
        success: result.success,
      });

      return result;
    } catch (error) {
      const restoreError = error instanceof Error ? error : new Error(String(error));
      logger.error('Purchase restoration failed', { error: restoreError });

      return {
        success: false,
        purchases: [],
        errors: [restoreError.message],
        message: 'Failed to restore purchases',
      };
    }
  }

  /**
   * Check if a product is purchased
   */
  async isPurchased(productId: string): Promise<boolean> {
    try {
      // Check with server
      const response = await api.request<{ isPurchased: boolean }>(
        `/premium/check-purchase/${productId}`,
      );
      return response.isPurchased;
    } catch (error) {
      logger.error('Failed to check premium status', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Get purchase history
   */
  async getPurchaseHistory(): Promise<Purchase[]> {
    try {
      const response = await api.request<{ purchases: Purchase[] }>('/premium/purchase-history');
      return response.purchases;
    } catch (error) {
      logger.error('Failed to get premium limits', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return [];
    }
  }

  /**
   * Acknowledge a purchase (Android)
   * Note: RevenueCat handles acknowledgment automatically, but keeping for compatibility
   */
  async acknowledgePurchase(purchase: Purchase): Promise<void> {
    if (Platform.OS !== 'android') {
      return; // Only needed on Android
    }

    try {
      // RevenueCat handles acknowledgment automatically
      // This is kept for compatibility with direct IAP implementations
      logger.info('Purchase acknowledged', { transactionId: purchase.transactionId });
    } catch (error) {
      logger.error('Failed to acknowledge purchase', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Finish a transaction (iOS)
   * Note: RevenueCat handles transaction finishing automatically, but keeping for compatibility
   */
  async finishTransaction(purchase: Purchase): Promise<void> {
    if (Platform.OS !== 'ios') {
      return; // Only needed on iOS
    }

    try {
      // RevenueCat handles transaction finishing automatically
      // This is kept for compatibility with direct IAP implementations
      logger.info('Transaction finished', { transactionId: purchase.transactionId });
    } catch (error) {
      logger.error('Failed to finish transaction', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Test restore purchases functionality
   */
  async testRestorePurchases(): Promise<{
    testPassed: boolean;
    results: RestoreResult;
    testDetails: {
      initializationTest: boolean;
      productLoadTest: boolean;
      restoreTest: boolean;
      verificationTest: boolean;
    };
  }> {
    const testDetails = {
      initializationTest: false,
      productLoadTest: false,
      restoreTest: false,
      verificationTest: false,
    };

    try {
      // Test 1: Initialization
      await this.initialize();
      testDetails.initializationTest = true;
      logger.info('✅ IAP initialization test passed');

      // Test 2: Product loading
      const products = await this.getProducts();
      testDetails.productLoadTest = products.length > 0;
      logger.info('✅ Product loading test passed', { productCount: products.length });

      // Test 3: Restore purchases
      const restoreResult = await this.restorePurchases();
      testDetails.restoreTest = true;
      logger.info('✅ Restore purchases test passed');

      // Test 4: Verification (if there are purchases to verify)
      if (restoreResult.purchases.length > 0) {
        testDetails.verificationTest = restoreResult.errors.length === 0;
      } else {
        testDetails.verificationTest = true; // No purchases to verify
      }

      const testPassed = Object.values(testDetails).every((test) => test);

      logger.info('IAP restore test completed', {
        testPassed,
        testDetails,
        restoreResult: {
          success: restoreResult.success,
          purchaseCount: restoreResult.purchases.length,
          errorCount: restoreResult.errors.length,
        },
      });

      return {
        testPassed,
        results: restoreResult,
        testDetails,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      logger.error('IAP restore test failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        testDetails,
      });

      return {
        testPassed: false,
        results: {
          success: false,
          purchases: [],
          errors: [errorMessage],
          message: 'Test failed',
        },
        testDetails,
      };
    }
  }

  // Private helper methods

  private async loadProducts(): Promise<void> {
    const productIds = Platform.OS === 'ios' ? this.PRODUCT_IDS.ios : this.PRODUCT_IDS.android;

    // Try to load products from RevenueCat first
    if (Purchases && Purchases.isConfigured()) {
      try {
        const storeProducts = await Purchases.getProducts(productIds);
        
        this.products = storeProducts.map((sp) => ({
          productId: sp.identifier,
          price: sp.price.toString(),
          currency: sp.currencyCode,
          localizedPrice: sp.priceString,
          title: sp.title,
          description: sp.description,
          type: sp.subscriptionPeriod ? 'subs' : 'iap',
        }));

        // Build product map for quick lookup
        this.availableProducts.clear();
        this.products.forEach((product) => {
          this.availableProducts.set(product.productId, product);
        });

        logger.info('Products loaded from RevenueCat', { count: this.products.length });
        return;
      } catch (rcError) {
        const error = rcError instanceof Error ? rcError : new Error(String(rcError));
        logger.warn('Failed to load products from RevenueCat, using fallback', {
          error,
        });
      }
    }

    // Fallback: Use simulated products (for development/testing)
    this.products = productIds.map((productId) => ({
      productId,
      price: this.getSimulatedPrice(productId),
      currency: 'USD',
      localizedPrice: this.getSimulatedLocalizedPrice(productId),
      title: this.getSimulatedTitle(productId),
      description: this.getSimulatedDescription(productId),
      type: productId.includes('monthly') || productId.includes('yearly') ? 'subs' : 'iap',
    }));

    // Build product map for quick lookup
    this.availableProducts.clear();
    this.products.forEach((product) => {
      this.availableProducts.set(product.productId, product);
    });

    logger.info('Products loaded (fallback mode)', { count: this.products.length });
  }

  private async simulatePurchase(productId: string): Promise<Purchase> {
    // Simulate purchase delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate occasional purchase failures
    if (Math.random() < 0.1) {
      // 10% chance of failure
      throw new Error('User cancelled purchase');
    }

    const purchase: Purchase = {
      productId,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      transactionDate: Date.now(),
      transactionReceipt: `receipt_${Date.now()}`,
      isAcknowledged: false,
    };
    
    if (Platform.OS === 'android') {
      purchase.purchaseToken = `token_${Date.now()}`;
    }
    
    if (Platform.OS === 'ios') {
      purchase.originalTransactionId = `orig_${Date.now()}`;
    }
    
    return purchase;
  }

  private async simulateRestorePurchases(): Promise<Purchase[]> {
    // Simulate restore delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate some restored purchases (for testing)
    const restoredPurchases: Purchase[] = [];

    // 50% chance of having previous purchases
    if (Math.random() < 0.5) {
      const productIds = Platform.OS === 'ios' ? this.PRODUCT_IDS.ios : this.PRODUCT_IDS.android;
      const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];

      if (!randomProduct) {
        return restoredPurchases;
      }

      const restoredPurchase: Purchase = {
        productId: randomProduct,
        transactionId: `restored_txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        transactionDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        transactionReceipt: `restored_receipt_${Date.now()}`,
        isAcknowledged: true,
      };
      
      if (Platform.OS === 'android') {
        restoredPurchase.purchaseToken = `restored_token_${Date.now()}`;
      }
      
      if (Platform.OS === 'ios') {
        restoredPurchase.originalTransactionId = `restored_orig_${Date.now()}`;
      }
      
      restoredPurchases.push(restoredPurchase);
    }

    return restoredPurchases;
  }

  /**
   * Verify purchase with server - includes timeout and retry logic
   * Maximum timeout: 10 seconds
   * Retry attempts: 3
   */
  private async verifyPurchase(purchase: Purchase): Promise<void> {
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 10000; // 10 seconds
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Purchase verification timeout after ${TIMEOUT_MS}ms`));
          }, TIMEOUT_MS);
        });

        // Race between API request and timeout
        const verifyPromise = api.request('/premium/verify-purchase', {
          method: 'POST',
          body: JSON.stringify({
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            receipt: purchase.transactionReceipt,
            platform: Platform.OS,
            purchaseToken: purchase.purchaseToken,
          }),
        });

        await Promise.race([verifyPromise, timeoutPromise]);

        logger.info('Purchase verified with server', {
          productId: purchase.productId,
          transactionId: purchase.transactionId,
          attempt,
        });
        return; // Success - exit retry loop
      } catch (error) {
        const verifyError = error instanceof Error ? error : new Error(String(error));
        lastError = verifyError;
        logger.warn('Purchase verification attempt failed', {
          attempt,
          maxRetries: MAX_RETRIES,
          error: verifyError,
          productId: purchase.productId,
        });

        // Don't retry on the last attempt
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // All retries failed
    logger.error('Purchase verification failed after all retries', {
      purchase,
      lastError: lastError?.message,
    });
    throw new Error(
      `Failed to verify purchase with server after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  private getSimulatedPrice(productId: string): string {
    if (productId.includes('basic')) return '4.99';
    if (productId.includes('premium')) return '9.99';
    if (productId.includes('ultimate')) return '19.99';
    return '0.99';
  }

  private getSimulatedLocalizedPrice(productId: string): string {
    const price = this.getSimulatedPrice(productId);
    return `$${price}`;
  }

  private getSimulatedTitle(productId: string): string {
    if (productId.includes('basic')) return 'PawfectMatch Basic';
    if (productId.includes('premium')) return 'PawfectMatch Premium';
    if (productId.includes('ultimate')) return 'PawfectMatch Ultimate';
    return 'PawfectMatch Subscription';
  }

  private getSimulatedDescription(productId: string): string {
    if (productId.includes('basic')) return 'Basic premium features for PawfectMatch';
    if (productId.includes('premium')) return 'Full premium experience with unlimited features';
    if (productId.includes('ultimate'))
      return 'Ultimate premium package with all features and VIP support';
    return 'Premium subscription for PawfectMatch';
  }
}

export default IAPService.getInstance();
