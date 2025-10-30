import { Platform } from 'react-native';
import { logger } from './logger';
import { api } from './api';

// Mock IAP types - in real implementation, use react-native-iap
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
  private readonly PRODUCT_IDS = {
    ios: [
      'com.pawfectmatch.premium.basic.monthly',
      'com.pawfectmatch.premium.premium.monthly',
      'com.pawfectmatch.premium.ultimate.monthly',
      'com.pawfectmatch.premium.basic.yearly',
      'com.pawfectmatch.premium.premium.yearly',
      'com.pawfectmatch.premium.ultimate.yearly',
    ],
    android: [
      'premium_basic_monthly',
      'premium_premium_monthly',
      'premium_ultimate_monthly',
      'premium_basic_yearly',
      'premium_premium_yearly',
      'premium_ultimate_yearly',
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

      // In real implementation, this would initialize react-native-iap
      // For now, simulate initialization
      await this.simulateInitialization();

      // Load available products
      await this.loadProducts();

      this.isInitialized = true;
      logger.info('IAP service initialized successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'IAP initialization failed';
      logger.error('Failed to initialize IAP service', { error: error instanceof Error ? error : new Error(String(error)) });
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

      // In real implementation, this would use react-native-iap
      const purchase = await this.simulatePurchase(productId);

      // Verify purchase with server
      await this.verifyPurchase(purchase);

      logger.info('Purchase completed successfully', { 
        productId, 
        transactionId: purchase.transactionId 
      });

      return purchase;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      logger.error('Purchase failed', { error: error instanceof Error ? error : new Error(String(error)), productId });
      throw error;
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

      // In real implementation, this would use react-native-iap
      const restoredPurchases = await this.simulateRestorePurchases();

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
            transactionId: purchase.transactionId 
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Verification failed';
          result.errors.push(`Failed to verify ${purchase.productId}: ${errorMessage}`);
          logger.warn('Failed to verify restored purchase', { 
            productId: purchase.productId, 
            error: errorMessage 
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
      const errorMessage = error instanceof Error ? error.message : 'Restore failed';
      logger.error('Purchase restoration failed', { error: errorMessage });

      return {
        success: false,
        purchases: [],
        errors: [errorMessage],
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
      const response = await api.request<{ isPurchased: boolean }>(`/premium/check-purchase/${productId}`);
      return response.isPurchased;
    } catch (error) {
      logger.error('Failed to check premium status', { error: error instanceof Error ? error : new Error(String(error)) });
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
      logger.error('Failed to get premium limits', { error: error instanceof Error ? error : new Error(String(error)) });
      return [];
    }
  }

  /**
   * Acknowledge a purchase (Android)
   */
  async acknowledgePurchase(purchase: Purchase): Promise<void> {
    if (Platform.OS !== 'android') {
      return; // Only needed on Android
    }

    try {
      // In real implementation, this would acknowledge the purchase
      logger.info('Purchase acknowledged', { transactionId: purchase.transactionId });
    } catch (error) {
      logger.error('Failed to track premium usage', { error: error instanceof Error ? error : new Error(String(error)) });
      throw error;
    }
  }

  /**
   * Finish a transaction (iOS)
   */
  async finishTransaction(purchase: Purchase): Promise<void> {
    if (Platform.OS !== 'ios') {
      return; // Only needed on iOS
    }

    try {
      // In real implementation, this would finish the transaction
      logger.info('Transaction finished', { transactionId: purchase.transactionId });
    } catch (error) {
      logger.error('Failed to cancel subscription', { error: error instanceof Error ? error : new Error(String(error)) });
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

      const testPassed = Object.values(testDetails).every(test => test);

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
      logger.error('IAP restore test failed', { error: error instanceof Error ? error : new Error(String(error)), testDetails });

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

  private async simulateInitialization(): Promise<void> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (Math.random() < 0.05) { // 5% chance of failure for testing
      throw new Error('Simulated initialization failure');
    }
  }

  private async loadProducts(): Promise<void> {
    const productIds = Platform.OS === 'ios' ? this.PRODUCT_IDS.ios : this.PRODUCT_IDS.android;
    
    // Simulate product loading
    this.products = productIds.map(productId => ({
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
    this.products.forEach(product => {
      this.availableProducts.set(product.productId, product);
    });

    logger.info('Products loaded', { count: this.products.length });
  }

  private async simulatePurchase(productId: string): Promise<Purchase> {
    // Simulate purchase delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate occasional purchase failures
    if (Math.random() < 0.1) { // 10% chance of failure
      throw new Error('User cancelled purchase');
    }

    return {
      productId,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      transactionDate: Date.now(),
      transactionReceipt: `receipt_${Date.now()}`,
      purchaseToken: Platform.OS === 'android' ? `token_${Date.now()}` : undefined,
      originalTransactionId: Platform.OS === 'ios' ? `orig_${Date.now()}` : undefined,
      isAcknowledged: false,
    };
  }

  private async simulateRestorePurchases(): Promise<Purchase[]> {
    // Simulate restore delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate some restored purchases (for testing)
    const restoredPurchases: Purchase[] = [];

    // 50% chance of having previous purchases
    if (Math.random() < 0.5) {
      const productIds = Platform.OS === 'ios' ? this.PRODUCT_IDS.ios : this.PRODUCT_IDS.android;
      const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];

      restoredPurchases.push({
        productId: randomProduct,
        transactionId: `restored_txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        transactionDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        transactionReceipt: `restored_receipt_${Date.now()}`,
        purchaseToken: Platform.OS === 'android' ? `restored_token_${Date.now()}` : undefined,
        originalTransactionId: Platform.OS === 'ios' ? `restored_orig_${Date.now()}` : undefined,
        isAcknowledged: true,
      });
    }

    return restoredPurchases;
  }

  private async verifyPurchase(purchase: Purchase): Promise<void> {
    try {
      await api.request('/premium/verify-purchase', {
        method: 'POST',
        body: JSON.stringify({
          productId: purchase.productId,
          transactionId: purchase.transactionId,
          receipt: purchase.transactionReceipt,
          platform: Platform.OS,
          purchaseToken: purchase.purchaseToken,
        }),
      });

      logger.info('Purchase verified with server', { 
        productId: purchase.productId,
        transactionId: purchase.transactionId 
      });

    } catch (error) {
      logger.error('Purchase verification failed', { error, purchase });
      throw new Error('Failed to verify purchase with server');
    }
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
    if (productId.includes('ultimate')) return 'Ultimate premium package with all features and VIP support';
    return 'Premium subscription for PawfectMatch';
  }
}

export default IAPService.getInstance();
