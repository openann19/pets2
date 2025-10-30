/**
 * Type definitions for react-native-purchases
 * RevenueCat React Native SDK
 */

declare module 'react-native-purchases' {
  export interface CustomerInfo {
    activeSubscriptions: string[];
    allPurchasedProductIdentifiers: string[];
    latestExpirationDate: string | null;
    nonSubscriptionTransactions: PurchasedProduct[];
    entitlements: {
      active: Record<string, EntitlementInfo>;
      all: Record<string, EntitlementInfo>;
    };
    firstSeen: string;
    originalAppUserId: string;
    originalPurchaseDate: string | null;
    requestDate: string;
    managementURL?: string | null;
  }

  export interface EntitlementInfo {
    expiresDate: string | null;
    identifier: string;
    isActive: boolean;
    latestPurchaseDate: string;
    originalPurchaseDate: string;
    periodType: 'NORMAL' | 'TRIAL' | 'INTRO' | 'PROMO';
    productIdentifier: string;
    purchaseDate: string;
    unsubscribeDetectedAt: string | null;
    willRenew: boolean;
    gracePeriodExpiresDate: string | null;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
    isSandbox: boolean;
  }

  export interface PurchasedProduct {
    identifier: string;
    originalTransactionDate: string;
    transactionDate: string;
    expirationDate: string | null;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
  }

  export interface PurchasesOfferings {
    current: PurchasesOffering | null;
    all: Record<string, PurchasesOffering>;
  }

  export interface PurchasesOffering {
    identifier: string;
    serverDescription: string;
    metadata: Record<string, unknown>;
    availablePackages: PurchasesPackage[];
    lifetime?: PurchasesPackage;
    annual?: PurchasesPackage;
    sixMonth?: PurchasesPackage;
    threeMonth?: PurchasesPackage;
    twoMonth?: PurchasesPackage;
    monthly?: PurchasesPackage;
    weekly?: PurchasesPackage;
  }

  export interface PurchasesPackage {
    identifier: string;
    packageType: string;
    product: PurchasesStoreProduct;
    offeringIdentifier: string;
  }

  export interface PurchasesStoreProduct {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
    introPrice?: PurchasesStoreProductDiscount;
    discounts?: PurchasesStoreProductDiscount[];
    subscriptionPeriod?: string;
    subscriptionGroupIdentifier?: string;
  }

  export interface PurchasesStoreProductDiscount {
    identifier?: string;
    price: number;
    priceString: string;
    cycles: number;
    period: string;
    periodUnit: string;
    periodNumberOfUnits: number;
  }

  export interface PurchaserInfo {
    activeSubscriptions: string[];
    activeEntitlements: string[];
    allPurchasedProductIdentifiers: string[];
    latestExpirationDate: string | null;
    firstSeen: string;
    originalAppUserId: string;
    originalPurchaseDate: string | null;
    managementURL?: string | null;
    nonSubscriptionTransactions: PurchasedProduct[];
  }

  export interface PurchasesError {
    code: number;
    message: string;
    underlyingErrorMessage?: string;
  }

  export enum PURCHASES_ERROR_CODE {
    UNKNOWN = 0,
    PURCHASE_CANCELLED = 1,
    STORE_PROBLEM = 2,
    PURCHASE_NOT_ALLOWED = 3,
    PURCHASE_INVALID = 4,
    PRODUCT_NOT_AVAILABLE_FOR_PURCHASE = 5,
    PRODUCT_ALREADY_PURCHASED = 6,
    PURCHASE_RECEIPT_MISSING = 7,
    CUSTOMER_INFO_ERROR = 8,
    SYSTEM_ERROR = 9,
    USER_CANCELLED = 10,
  }

  export interface PurchasesConfig {
    apiKey: string;
    appUserID?: string;
    observerMode?: boolean;
  }

  export interface PurchasesIntroEligibility {
    status: 'INTRO_ELIGIBILITY_STATUS_UNKNOWN' | 'INTRO_ELIGIBILITY_STATUS_ELIGIBLE' | 'INTRO_ELIGIBILITY_STATUS_INELIGIBLE';
  }

  export default class Purchases {
    static configure(config: PurchasesConfig): Promise<void>;
    
    static setLogLevel(level: 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): void;
    
    static getOfferings(): Promise<PurchasesOfferings>;
    
    static getProducts(productIdentifiers: string[]): Promise<PurchasesStoreProduct[]>;
    
    static purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo }>;
    
    static purchaseProduct(productIdentifier: string): Promise<{ customerInfo: CustomerInfo }>;
    
    static getCustomerInfo(): Promise<{ customerInfo: CustomerInfo }>;
    
    static restorePurchases(): Promise<{ customerInfo: CustomerInfo }>;
    
    static getAppUserID(): string;
    
    static setAppUserID(appUserID: string): Promise<{ customerInfo: CustomerInfo }>;
    
    static syncPurchases(): Promise<void>;
    
    static canMakePayments(): Promise<boolean>;
    
    static getOfferings(): Promise<PurchasesOfferings>;
    
    static logIn(appUserID: string): Promise<{ customerInfo: CustomerInfo; created: boolean }>;
    
    static logOut(): Promise<{ customerInfo: CustomerInfo }>;
    
    static setEmail(email: string): Promise<void>;
    
    static setPhoneNumber(phoneNumber: string): Promise<void>;
    
    static setDisplayName(displayName: string): Promise<void>;
    
    static setAttributes(attributes: Record<string, string>): Promise<void>;
    
    static setAdjustID(adjustID: string): Promise<void>;
    
    static setAppsflyerID(appsFlyerID: string): Promise<void>;
    
    static setFBAnonymousID(fbAnonymousID: string): Promise<void>;
    
    static setMparticleID(mparticleID: string): Promise<void>;
    
    static setOnesignalID(onesignalID: string): Promise<void>;
    
    static setAirshipChannelID(airshipChannelID: string): Promise<void>;
    
    static setMediaSource(mediaSource: string): Promise<void>;
    
    static setCampaign(campaign: string): Promise<void>;
    
    static setAdGroup(adGroup: string): Promise<void>;
    
    static setAd(ad: string): Promise<void>;
    
    static setKeyword(keyword: string): Promise<void>;
    
    static setCreative(creative: string): Promise<void>;
    
    static collectDeviceIdentifiers(): Promise<void>;
    
    static enableAdServicesAttributionTokenCollection(): Promise<void>;
    
    static getEntitlements(): Promise<Record<string, EntitlementInfo>>;
    
    static invalidateCustomerInfoCache(): void;
    
    static isConfigured(): boolean;
    
    static setIsConfigured(isConfigured: boolean): void;
  }

  export { CustomerInfo, PurchasesOffering, PurchasesPackage };
}

