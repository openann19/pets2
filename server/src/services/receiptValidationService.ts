/**
 * Receipt Validation Service
 * 
 * Production-ready receipt validation for Apple App Store and Google Play
 * Implements security best practices to prevent fraud
 * 
 * Environment Variables Required:
 * - APPLE_APP_STORE_SHARED_SECRET (for iOS App Store validation)
 * - GOOGLE_PLAY_SERVICE_ACCOUNT_KEY (JSON key for Google Play API)
 * - APPLE_APP_BUNDLE_ID (e.g., com.pawfectmatch.app)
 * - GOOGLE_PLAY_PACKAGE_NAME (e.g., com.pawfectmatch)
 */

import https from 'https';
import { URL } from 'url';
import logger from '../utils/logger';

interface AppleReceiptValidationResponse {
  status: number;
  receipt?: {
    receipt_type: string;
    bundle_id: string;
    in_app: Array<{
      transaction_id: string;
      product_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    transaction_id: string;
    product_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
    is_trial_period?: string;
    is_in_intro_offer_period?: string;
  }>;
  environment?: 'Sandbox' | 'Production';
}

interface GooglePlayValidationResponse {
  kind: string;
  purchaseTimeMillis: string;
  purchaseState: number; // 0 = purchased, 1 = canceled
  consumptionState: number; // 0 = yet to be consumed, 1 = consumed
  developerPayload?: string;
  orderId: string;
  purchaseType?: number;
  acknowledgmentState: number; // 0 = yet to be acknowledged, 1 = acknowledged
}

/**
 * Validate Apple App Store receipt
 * 
 * Uses App Store Receipt Validation API (v1 - production)
 * For App Store Server API (v2), would need server-to-server notifications
 */
export async function validateAppleReceipt(
  receiptData: string,
  transactionId?: string,
): Promise<{
  valid: boolean;
  productId?: string;
  transactionId?: string;
  expiresAt?: Date;
  environment?: 'Sandbox' | 'Production';
  error?: string;
}> {
  try {
    // Validate input
    if (!receiptData || receiptData.length < 10) {
      return { valid: false, error: 'Invalid receipt data format' };
    }

    const bundleId = process.env.APPLE_APP_BUNDLE_ID || 'com.pawfectmatch.app';
    const sharedSecret = process.env.APPLE_APP_STORE_SHARED_SECRET;

    // Use production endpoint first
    let validationResult = await validateWithApple(
      receiptData,
      bundleId,
      sharedSecret,
      'https://buy.itunes.apple.com/verifyReceipt',
    );

    // If status 21007, receipt is from sandbox - retry with sandbox endpoint
    if (validationResult.status === 21007) {
      logger.info('Receipt is from sandbox, validating with sandbox endpoint');
      validationResult = await validateWithApple(
        receiptData,
        bundleId,
        sharedSecret,
        'https://sandbox.itunes.apple.com/verifyReceipt',
      );
    }

    // Status 0 = success
    if (validationResult.status !== 0) {
      const errorMessages: Record<number, string> = {
        21000: 'The App Store could not read the receipt data',
        21002: 'The receipt data was malformed or missing',
        21003: 'The receipt could not be authenticated',
        21004: 'The shared secret does not match',
        21005: 'The receipt server is temporarily unavailable',
        21006: 'This receipt is valid but the subscription has expired',
        21007: 'This receipt is from the sandbox environment',
        21008: 'This receipt is from the production environment',
        21010: 'This receipt could not be authorized',
      };

      return {
        valid: false,
        error: errorMessages[validationResult.status] || `Apple validation error: ${validationResult.status}`,
      };
    }

    // Extract transaction info
    const receipt = validationResult.receipt;
    const latestReceiptInfo = validationResult.latest_receipt_info || receipt?.in_app || [];

    // If transactionId provided, find specific transaction
    let transaction;
    if (transactionId) {
      transaction = latestReceiptInfo.find(
        (t) => t.transaction_id === transactionId,
      );
    } else {
      // Use most recent transaction
      transaction = latestReceiptInfo.sort(
        (a, b) => parseInt(b.purchase_date_ms) - parseInt(a.purchase_date_ms),
      )[0];
    }

    if (!transaction) {
      return {
        valid: false,
        error: transactionId
          ? `Transaction ${transactionId} not found in receipt`
          : 'No transactions found in receipt',
      };
    }

    // Check if subscription expired (if it's a subscription)
    let expiresAt: Date | undefined;
    if (transaction.expires_date_ms) {
      expiresAt = new Date(parseInt(transaction.expires_date_ms));
      if (expiresAt < new Date()) {
        return {
          valid: false,
          error: 'Subscription has expired',
          expiresAt,
        };
      }
    }

    return {
      valid: true,
      productId: transaction.product_id,
      transactionId: transaction.transaction_id,
      expiresAt,
      environment: validationResult.environment,
    };
  } catch (error) {
    logger.error('Apple receipt validation error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Receipt validation failed',
    };
  }
}

/**
 * Validate Google Play purchase token
 * 
 * Uses Google Play Developer API v3
 * Requires service account JSON key
 */
export async function validateGooglePlayPurchase(
  packageName: string,
  productId: string,
  purchaseToken: string,
): Promise<{
  valid: boolean;
  orderId?: string;
  purchaseTime?: Date;
  purchaseState?: number;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!packageName || !productId || !purchaseToken) {
      return {
        valid: false,
        error: 'Missing required parameters: packageName, productId, or purchaseToken',
      };
    }

    const serviceAccountKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      logger.warn('Google Play service account key not configured, skipping validation');
      // In development, allow if configured to skip
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_GOOGLE_VALIDATION === 'true') {
        return { valid: true, orderId: purchaseToken };
      }
      return {
        valid: false,
        error: 'Google Play service account key not configured',
      };
    }

    // Parse service account key
    let credentials: {
      client_email?: string;
      private_key?: string;
    };
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch {
      return {
        valid: false,
        error: 'Invalid Google Play service account key format',
      };
    }

    if (!credentials.client_email || !credentials.private_key) {
      return {
        valid: false,
        error: 'Service account key missing client_email or private_key',
      };
    }

    // Get OAuth2 access token
    const accessToken = await getGoogleAccessToken(credentials);
    if (!accessToken) {
      return {
        valid: false,
        error: 'Failed to obtain Google OAuth2 access token',
      };
    }

    // Validate purchase with Google Play API
    const apiUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

    const response = await makeGoogleAPIRequest<GooglePlayValidationResponse>(
      apiUrl,
      accessToken,
    );

    // Check purchase state: 0 = purchased, 1 = canceled
    if (response.purchaseState !== 0) {
      return {
        valid: false,
        error: 'Purchase was canceled or refunded',
        orderId: response.orderId,
      };
    }

    return {
      valid: true,
      orderId: response.orderId,
      purchaseTime: new Date(parseInt(response.purchaseTimeMillis)),
      purchaseState: response.purchaseState,
    };
  } catch (error) {
    logger.error('Google Play purchase validation error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Purchase validation failed',
    };
  }
}

// Helper functions

async function validateWithApple(
  receiptData: string,
  bundleId: string,
  sharedSecret: string | undefined,
  endpoint: string,
): Promise<{ status: number } & AppleReceiptValidationResponse> {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      'receipt-data': receiptData,
      password: sharedSecret, // Optional but recommended for subscriptions
      'exclude-old-transactions': true,
    });

    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      timeout: 10000, // 10 second timeout
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data) as {
            status: number;
          } & AppleReceiptValidationResponse;
          resolve(result);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Apple response: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Apple validation request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Apple validation request timed out'));
    });

    req.write(requestBody);
    req.end();
  });
}

async function getGoogleAccessToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string | null> {
  try {
    // Use Google OAuth2 JWT flow
    // Import jsonwebtoken - available in codebase (used in auth.ts)
    const jwt = await import('jsonwebtoken');
    const now = Math.floor(Date.now() / 1000);

    const jwtPayload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour expiry
      iat: now,
    };

    // Handle both default and named exports for jsonwebtoken
    const sign = (jwt as any).default?.sign || (jwt as any).sign || jwt;
    const jwtToken = sign(jwtPayload, credentials.private_key, {
      algorithm: 'RS256',
    });

    // Exchange JWT for access token
    const formData = new URLSearchParams();
    formData.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    formData.append('assertion', jwtToken);

    const tokenResponse = await new Promise<{
      access_token: string;
      token_type: string;
      expires_in: number;
    }>((resolve, reject) => {
      const urlObj = new URL('https://oauth2.googleapis.com/token');
      const formDataString = formData.toString();

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formDataString),
        },
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data) as {
                access_token: string;
                token_type: string;
                expires_in: number;
              });
            } catch (error) {
              reject(
                new Error(
                  `Failed to parse token response: ${error instanceof Error ? error.message : String(error)}`,
                ),
              );
            }
          } else {
            reject(
              new Error(
                `Token exchange failed with status ${res.statusCode}: ${data}`,
              ),
            );
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Token exchange request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Token exchange request timed out'));
      });

      req.write(formDataString);
      req.end();
    });

    return tokenResponse.access_token || null;
  } catch (error) {
    logger.error('Failed to get Google access token', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function makeGoogleAPIRequest<T>(
  url: string,
  accessToken?: string,
  body?: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestBody = body ? JSON.stringify(body) : undefined;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: body ? 'POST' : 'GET',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(body && {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody || ''),
        }),
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data) as T);
          } catch (error) {
            reject(
              new Error(
                `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
              ),
            );
          }
        } else {
          reject(
            new Error(
              `API request failed with status ${res.statusCode}: ${data}`,
            ),
          );
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Google API request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Google API request timed out'));
    });

    if (requestBody) {
      req.write(requestBody);
    }
    req.end();
  });
}

/**
 * Validate receipt for either platform
 * Auto-detects platform based on receipt format
 */
export async function validateReceipt(
  receipt: string,
  platform: 'ios' | 'android',
  purchaseToken?: string,
  productId?: string,
): Promise<{
  valid: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}> {
  if (platform === 'ios') {
    const result = await validateAppleReceipt(receipt);
    return {
      valid: result.valid,
      productId: result.productId,
      transactionId: result.transactionId,
      error: result.error,
    };
  } else {
    // Android
    if (!purchaseToken || !productId) {
      return {
        valid: false,
        error: 'Android validation requires purchaseToken and productId',
      };
    }

    const packageName =
      process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.pawfectmatch';
    const result = await validateGooglePlayPurchase(
      packageName,
      productId,
      purchaseToken,
    );

    return {
      valid: result.valid,
      transactionId: result.orderId,
      error: result.error,
    };
  }
}

